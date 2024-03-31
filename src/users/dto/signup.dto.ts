import { PickType } from "@nestjs/mapped-types";
import { User } from "../entities/user.entity";
import { IsNotEmpty, IsString } from "class-validator";

export class SignupDto extends PickType(User, [
    'profileImage',
    'name',
    'email',
    'password',
    'birth',
    'gender',
    'phone',
    'nickName'
]) {
    @IsString()
    @IsNotEmpty({ message: "비밀번호 확인을 입력해주세요." })
    readonly checkPassword: string;
}
