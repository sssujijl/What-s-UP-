import { PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

export class signinDto extends PickType(User, ['email', 'password']) {
  /**
   * 이메일
   * @example 'jinni1226@naver.com'
   */
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  @IsEmail()
  readonly email: string;

  /**
   * 비밀번호
   * @example 'abc123'
   */
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @IsString()
  readonly password: string;
}
