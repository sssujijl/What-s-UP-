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
      const missionResStatus = await this.resStatusRepository.find({
        where: { missionId: mission.id },
      });
      const reservations = [];
      for (const resStatus of missionResStatus) {
        const reservation = await this.reservationRepository.find({
          where: { resStatusId: resStatus.id },
        });
        reservations.push(...reservation);
      }
      const reviews = [];
      for (const reservation of reservations) {
        const currentReviews = await this.reviewRepository.find({
          where: { reservationId: reservation.id },
        });
        reviews.push(...currentReviews);
      }

      if (reviews.length < mission.capacity) {
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
        await queryRunner.commitTransaction();
        return data;
      } else {
        await queryRunner.rollbackTransaction();
        console.log(
          '미션 수용 인원을 초과하여 리뷰를 등록할 수 없습니다. 일반 리뷰 등록을 시도합니다.',
        );
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    const reviews = await this.reviewRepository.find();
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

  async remove(id: number) {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }
    await this.reviewRepository.delete(id);
  }
}
