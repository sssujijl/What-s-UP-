import { PickType } from "@nestjs/mapped-types";
import { User_Title } from "../entities/user_titles.entity";

export class CreateUserTitleDto extends PickType(User_Title,[
    'titleId',
    'count'
]){}