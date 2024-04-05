import { PickType } from "@nestjs/mapped-types";
import { Title } from "../entities/title.entity";

export class CreateTitleDto extends PickType(Title,[
    'level',
    'foodCategoryId'
]){}
