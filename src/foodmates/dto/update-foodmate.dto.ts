import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import { PickType } from '@nestjs/swagger';
import { FoodMate } from '../entities/foodmate.entity';
import { Gender } from '../types/gender.type';
import { Age } from '../types/age.type';
import { Status } from '../types/status.type';
import { Type } from 'class-transformer';

export class UpdateFoodmateDto extends PickType(FoodMate, [
  'content',
  'gender',
  'age',
  'region',
  'dateTime',
  'capacity',
  'status',
]) {
  /**
   * 내용
   * @example "낯가려도 괜찮으신 분"
   */
  @IsString()
  readonly content: string;

  /**
   * 성별
   * @example "F"
   */
  @IsNotEmpty()
  @IsString()
  readonly gender: Gender;

  /**
   * 나이
   * @example "10대"
   */
  @IsNotEmpty()
  @IsString()
  readonly age: string;

  /**
   *  지역
   * @example "Busan"
   */
  @IsNotEmpty()
  @IsString()
  readonly region: string;

  /**
   * 일시
   * @example "2024-04-05T10:00:00Z"
   */
  @IsNotEmpty()
  @Type(() => Date)
  readonly dateTime: Date;

  /**
   * 인원
   * @example "5"
   */
  @IsNotEmpty()
  @IsString()
  readonly capacity: string;

  /**
   * 상태
   * @example "RECRUITMENT_COMPLETED"
   */
  @IsString()
  readonly status: Status;
}
