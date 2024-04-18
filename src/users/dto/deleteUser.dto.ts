import { PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteUserDto extends PickType(User, ['password']) {
  /**
   * 비밀번호
   * @example 'abc123'
   */
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @IsString()
  readonly password: string;
}
