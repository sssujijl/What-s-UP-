import { PickType } from "@nestjs/mapped-types";
import { User } from "../entities/user.entity";

export class signinDto extends PickType(User, [
    'email',
    'password'
]) {}
