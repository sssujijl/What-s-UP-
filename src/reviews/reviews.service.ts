import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { DataSource, Repository } from 'typeorm';
import { TitlesService } from 'src/titles/titles.service';
import { Place } from 'src/places/entities/place.entity';
import { Mission } from 'src/missions/entities/mission.entity';
import { ResStatus } from 'src/reservations/entities/resStatus.entity';
import { Reservation } from 'src/reservations/entities/reservation.entity';
import { MissionsService } from 'src/missions/missions.service';
import { Status } from 'src/missions/types/status.types';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class ReviewsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(ResStatus)
    private readonly resStatusRepository: Repository<ResStatus>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly titleService: TitlesService,
    private readonly missionService: MissionsService,
    @InjectQueue('mission-review') private readonly missionReviewQueue: Queue,
  ) {}

  async create(
    createReviewDto: CreateReviewDto,
    userId: number,
    reservationId: number,
    place: Place,
  ) {
    const placeId = place.id;
    const review = this.reviewRepository.create({
      ...createReviewDto,
      userId,
      reservationId,
      placeId,
    });
    const data = await this.reviewRepository.save(review);
    const count = 1;

    await this.titleService.givenTitle(userId, place.foodCategoryId, count);

    return data;
  }

  async addMissionReviewQueue(
    createReviewDto: CreateReviewDto,
    userId: number,
    reservationId: number,
    place: Place,
    mission: Mission,
  ) {
    const job = await this.missionReviewQueue.add('createMissionReview', {
      createReviewDto,
      userId,
      reservationId,
      place,
      mission,
    });
    const result = await job.finished();
    return result;
  }

  async createMissionReview(
    createReviewDto: CreateReviewDto,
    userId: number,
    reservationId: number,
    place: Place,
    mission: Mission,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      mission = await this.missionService.updateMissionStatus(mission.id);

      if (mission.status !== Status.GARDEN_FULL) {
        const placeId = place.id;
        const count = 2;
        const review = this.reviewRepository.create({
          ...createReviewDto,
          userId,
          reservationId,
          placeId,
        });
        const data = await this.reviewRepository.save(review);
        await this.titleService.givenTitle(userId, place.foodCategoryId, count);
        await queryRunner.manager.save(review);
        await this.missionService.updateMissionStatus(mission.id);
        await queryRunner.commitTransaction();
        return data;
      } else {
        await queryRunner.rollbackTransaction();
        console.log(
          '미션 수용 인원을 초과하여 미션 리뷰를 등록할 수 없습니다. 일반 리뷰 등록을 시도합니다.',
        );
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(placeId: number) {
    const reviews = await this.reviewRepository.findBy({ placeId });
    return reviews;
  }

  async findOne(id: number) {
    const review = await this.reviewRepository.findOne({ where: { id } });
    return review;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto) {
    const { content, images, rating } = updateReviewDto;

    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    await this.reviewRepository.update(id, { content, images, rating });
  }

  async remove(id: number, userId: number) {
    const review = await this.reviewRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    if (review.userId !== userId) {
      throw new UnauthorizedException('리뷰를 수정할 권한이 없습니다.');
    }

    await this.reviewRepository.delete(id);
  }
}
