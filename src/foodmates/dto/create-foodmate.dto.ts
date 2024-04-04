import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import { PickType } from '@nestjs/swagger';
import { FoodMate } from '../entities/foodmate.entity';
import { Gender } from '../types/gender.type';
import { Age } from '../types/age.type';
import { Type } from 'class-transformer';

export class CreateFoodmateDto extends PickType(FoodMate, [
  'content',
  'gender',
  'age',
  'region',
  'dateTime',
  'capacity',
]) {
  /**
   * 내용
   * @example "아무나 환영합니다"
   */
  @IsString()
  readonly content: string;

  /**
   * 성별
   * @example "M"
   */
  @IsNotEmpty()
  @IsString()
  readonly gender: Gender;

  /**
   * 나이
   * @example "TEENS"
   */
  @IsNotEmpty()
  @IsString()
  readonly age: Age;

  /**
   *  지역
   * @example "Seoul"
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
   * @example "3"
   */
  @IsNotEmpty()
  @IsInt()
  readonly capacity: number;

  /**
   * 카테고리ID
   * @example "1"
   */
  @IsNotEmpty()
  @IsInt()
  readonly foodCategoryId: number;
}
