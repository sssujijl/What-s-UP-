import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { TitlesService } from 'src/titles/titles.service';
import { Place } from 'src/places/entities/place.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private readonly reviewRepository: Repository<Review>,
    private readonly titleService: TitlesService
  ) {}

  async create(createReviewDto: CreateReviewDto, place: Place) {
    const review = await this.reviewRepository.save(createReviewDto);


    return review;
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

    if (review.userId !== updateReviewDto.userId) {
      throw new UnauthorizedException('리뷰를 수정할 권한이 없습니다.');
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
