import { PickType } from "@nestjs/mapped-types";
import { User } from "../entities/user.entity";

export class EditUserDto extends PickType(User, [
    'profileImage',
    'name',
    'email',
    'password',
    'birth',
    'gender',
    'phone',
    'nickName'
]) {
    readonly newPassword: string;
    readonly newCheckPassword: string;
}
