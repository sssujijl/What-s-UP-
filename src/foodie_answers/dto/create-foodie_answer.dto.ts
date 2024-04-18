import { PickType } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { Foodie_Answer } from "../entities/foodie_answer.entity";


export class CreateFoodieAnswerDto extends PickType(Foodie_Answer, [
    'foodieId',
    'userId',
    'content',
    'images'
]) {
    /**
   * 내용
   * @example "이 집 맛있습니다."
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
