import { PickType } from '@nestjs/mapped-types';
import { CreateFoodieDto } from './create-foodie.dto';
import { Foodie } from '../entities/foodie.entity';

export class UpdateFoodieDto extends PickType(Foodie, [
    "userId",
    "titleId",
    "title",
    "content",
    "images"
]) {}
