import { PickType } from "@nestjs/swagger";
import { User } from "../entities/user.entity";

export class CheckDuplicateDto {
    /**
     * 이메일
     * @example 'example@naver.com'
     */
    readonly email?: string;

    /**
     * 닉네임
     * @example 'nickName'
     */
    readonly nickName?: string;

    /**
     * 휴대전화번호
     * @example '01012345678
     */
    readonly phone?: string;
}