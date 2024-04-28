import { PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Gender } from '../types/gender.types';

export class AdditionalInfoDto extends PickType(User, [
  'birth',
  'gender',
  'phone',
  'nickName',
  'smsConsent',
]) {
  /**
   * 휴대전화번호
   * @example '01012345678'
   */
  @IsString()
  @IsNotEmpty({ message: '휴대전화번호를 입력해주세요.' })
  readonly phone: string;

  /**
   * 닉네임
   * @example '성진짱'
   */
  @IsNotEmpty({ message: '닉네임을 입력해주세요.' })
  @IsString()
  readonly nickName: string;

  /**
   * 생년월일
   * @example '2024-04-05'
   */
  @IsNotEmpty({ message: '생년월일을 입력해주세요.' })
  readonly birth: Date;

  /**
   * 성별
   * @example 'M'
   */
  @IsNotEmpty({ message: '성별을 선택해주세요.' })
  @IsEnum(Gender)
  readonly gender: Gender;

  /**
   * sms 발송여부
   * @example 'true'
   */
  readonly smsConsent: boolean;
}
