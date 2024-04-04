import { PickType } from "@nestjs/mapped-types";
import { Foodie } from "../entities/foodie.entity";

export class CreateFoodieDto extends PickType(Foodie, [
    'userId',
    'title',
    'content',
    'images',
    'titleId'
]) {}