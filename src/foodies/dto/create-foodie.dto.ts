import { PickType } from '@nestjs/swagger';
import { Foodie } from '../entities/foodie.entity';
import { IsString } from 'class-validator';

export class CreateFoodieDto extends PickType(Foodie, [
  'userId',
  'title',
  'content',
  'images',
  'titleId',
]) {
  /**
   * 제목
   * @example "마라탕에 넣을 거 추천해주세요"
   */
  @IsString()
  readonly title: string;
}
