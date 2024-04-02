import { PickType } from "@nestjs/mapped-types";
import { User } from "../entities/user.entity";

export class DeleteUserDto extends PickType (User, ['password']) {}