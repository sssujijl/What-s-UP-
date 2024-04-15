import { PickType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
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
  reservationId?: number;

  /**
   * 가게ID
   * @example '1'
   */
  @IsNotEmpty()
  placeId: number;

  /**
   * 유저ID
   * @example '1'
   */
  userId: number;

  /**
   * 미션여부
   * @example false
   */
  isMission?: boolean;
}
