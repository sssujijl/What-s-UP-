import { PickType } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { Foodie } from "../entities/foodie.entity";

export class CreateFoodieDto extends PickType(Foodie, [
    'userId',
    'title',
    'content',
    'images',
    'titleId'
]) {
    /**
   * 제목
   * @example "이 집 마라탕 맛있나요"
   */
  @IsString()
  readonly title: string;

  /**
   * 내용
   * @example "이 마라탕 집 가보려고 하는데 어떨까요?"
   */
   @IsString()
   readonly content: string;

   /**
   * 사진
   * @example "사진"
   */
  @IsString()
  readonly images: string;

}