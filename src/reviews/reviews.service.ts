import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async create(createReviewDto: CreateReviewDto) {
    const review = await this.reviewRepository.save(createReviewDto);
    return review;
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
