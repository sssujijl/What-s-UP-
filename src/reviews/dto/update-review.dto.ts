import { PickType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Rating } from '../types/rating.types';
import { Review } from '../entities/review.entity';

export class UpdateReviewDto extends PickType(Review, ['content']) {
  /**
   * 이미지
   * @example ""
   */
  @IsOptional()
  @IsString()
  readonly images?: string;

  /**
   * 내용
   * @example "별로네"
   */
  @IsString()
  readonly content: string;

  /**
   * 평점
   * @example "Rating_1"
   */
  @IsOptional()
  @IsEnum(Rating)
  readonly rating?: Rating;
}
