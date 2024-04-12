import { PickType } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { User } from "../entities/user.entity";

export class CheckVerification extends PickType(User, ['email']) {
    @IsString()
    @IsNotEmpty({ message: '인증코드를 입력해주세요.' })
    checkVerificationCode: string;
}