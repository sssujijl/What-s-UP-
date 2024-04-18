import { PickType } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Rating } from '../types/rating.types';
import { Review } from '../entities/review.entity';

export class CreateReviewDto extends PickType(Review, ['content']) {
  /**
   * 이미지
   * @example ""
   */
  @IsOptional()
  @IsString()
  readonly images?: string;

  /**
   * 내용
   * @example "너무 맛있어요"
   */
  @IsString()
  readonly content: string;

  /**
   * 평점
   * @example "Rating_5"
   */
  @IsOptional()
  @IsEnum(Rating)
  readonly rating?: Rating;
}
