import { PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { IsNotEmpty, IsEmail, IsString, IsDate, IsEnum } from 'class-validator';
import { Gender } from '../types/gender.types';

export class EditUserDto extends PickType(User, [
  'profileImage',
  'name',
  'email',
  'password',
  'birth',
  'gender',
  'phone',
  'nickName',
]) {
  /**
   * 이메일
   * @example 'example@naver.com'
   */
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  @IsEmail()
  readonly email: string;

  /**
   * 이름
   * @example '김성진'
   */
  @IsNotEmpty({ message: '성함을 입력해주세요.' })
  @IsString()
  readonly name: string;

  /**
   * 비밀번호
   * @example 'abc123'
   */
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @IsString()
  password: string;

  /**
   * 비밀번호 확인
   * @example 'abc123'
   */
  @IsString()
  @IsNotEmpty({ message: '비밀번호 확인을 입력해주세요.' })
  readonly checkPassword: string;

  /**
   * 휴대전화번호
   * @example '01012345678'
   */
  @IsString()
  @IsNotEmpty({ message: '휴대전화번호를 입력해주세요.' })
  readonly phone: string;

  /**
   * 닉네임
   * @example 'nickName'
   */
  @IsNotEmpty({ message: '닉네임을 입력해주세요.' })
  @IsString()
  readonly nickName: string;

  /**
   * 생년월일
   * @example '2024-04-05'
   */
  @IsNotEmpty({ message: '생년월일을 입력해주세요.' })
  @IsDate()
  readonly birth: Date;

  /**
   * 성별
   * @example 'F'
   */
  @IsNotEmpty({ message: '성별을 선택해주세요.' })
  @IsEnum(Gender)
  readonly gender: Gender;

  /**
   * 새 비밀번호
   * @example 'newabc123'
   */
  readonly newPassword: string;

  /**
   * 새 비밀번호 확인
   * @example 'newabc123'
   */
  readonly newCheckPassword: string;
}
