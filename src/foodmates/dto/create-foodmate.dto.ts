import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import { PickType } from '@nestjs/swagger';
import { FoodMate } from '../entities/foodmate.entity';
import { Gender } from '../types/gender.type';

export class CreateFoodmateDto extends PickType(FoodMate, [
  'title',
  'content',
  'gender',
  'age',
  'region',
  'dateTime',
  'capacity',
  'userId',
  'foodCategoryId'
]) {
  /**
   * 유저ID
   * @example '1'
   */
  userId: number;

  /**
   * 제목
   * @example "오늘 삼겹살 먹을 사람"
   */
  @IsString()
  readonly title: string;
  
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
   * @example "10대"
   */
  @IsNotEmpty()
  @IsString()
  readonly age: string;

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
  // @Type(() => Date)
  readonly dateTime: Date;

  /**
   * 인원
   * @example "3명"
   */
  @IsNotEmpty()
  @IsString()
  readonly capacity: string;

  /**
   * 카테고리ID
   * @example "1"
   */
  @IsNotEmpty()
  @IsInt()
  readonly foodCategoryId: number;
}
