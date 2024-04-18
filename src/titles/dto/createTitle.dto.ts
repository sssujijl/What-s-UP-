import { PickType } from "@nestjs/swagger";
import { Title } from "../entities/titles.entity";

export class CreateTitleDto extends PickType(Title, [
    'userId',
    'foodCategoryId',
    'count'
]) {}