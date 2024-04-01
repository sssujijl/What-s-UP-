import { PickType } from "@nestjs/mapped-types";
import { Foodie } from "../entities/foodie.entity";

export class CreateFoodieDto extends PickType(Foodie, [
    'userId',
    'content',
    'images',
    'titleId',
    'views',
    'status'
]) {}