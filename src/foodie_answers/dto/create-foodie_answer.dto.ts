import { PickType } from "@nestjs/mapped-types";
import { Foodie_Answer } from "../entities/foodie_answer.entity";


export class CreateFoodieAnswerDto extends PickType(Foodie_Answer, [
    'userId',
    'content',
    'images'
]) {}
