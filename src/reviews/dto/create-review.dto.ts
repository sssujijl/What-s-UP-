import { PickType } from '@nestjs/mapped-types';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsNotEmpty,
} from 'class-validator';
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

  /**
   * 예약ID
   * @example "1"
   */
  @IsNotEmpty()
  @IsInt()
  readonly reservationId: number;
}
