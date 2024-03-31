import { PartialType, PickType } from '@nestjs/mapped-types';
import { Foodie_Answer } from '../entities/foodie_answer.entity';
import { CreateFoodieAnswerDto } from './create-foodie_answer.dto';

export class UpdateFoodieAnswerDto extends PickType(Foodie_Answer, [
    "foodieId",
    "userId",
    "content",
    "images"
]) {}
