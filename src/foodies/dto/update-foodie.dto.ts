import { PickType } from '@nestjs/mapped-types';
import { Foodie } from '../entities/foodie.entity';

export class UpdateFoodieDto extends PickType(Foodie, [
    "titleId",
    "title",
    "content",
    "images"
]) {}
