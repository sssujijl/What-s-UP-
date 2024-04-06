import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from "bcryptjs";
import { SignupDto } from './dto/signup.dto';
import { signinDto } from './dto/signin.dto';
import { EditUserDto } from './dto/editUser.dto';
import { DeleteUserDto } from './dto/deleteUser.dto';
import { Point } from 'src/points/entities/point.entity';
import { SendMailService } from 'src/users/sendMail.service';
import { number } from 'joi';
import Redis from 'ioredis';
import { CheckVerification } from './dto/checkVerification.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private dataSource: DataSource,
    @InjectRedis() private readonly redis: Redis
  ) {}

  async signup(signupDto: SignupDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (signupDto.password !== signupDto.checkPassword) {
        throw new Error('비밀번호가 일치하지 않습니다.');
      }

      const salt = await bcrypt.genSalt();
      signupDto.password = await bcrypt.hash(signupDto.password, salt);

      const verification = await this.redis.get(`VerificationCheck:${signupDto.email}`);

      if (!verification) {
        throw new UnauthorizedException('이메일 인증을 완료해주세요.');
      } else {
        await this.redis.del(`VerificationCheck:${signupDto.email}`);
        signupDto.isVerified = true;
      }

      const user = await queryRunner.manager.save(User, signupDto);

      const userPoint = { userId: user.id, point: 3000};
      await queryRunner.manager.save(Point, userPoint);

      await queryRunner.commitTransaction();

      return await this.findUserById(user.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return { message: `${err}` }
    } finally {
      await queryRunner.release();
    }
  }

  async checkVerificationCode(checkVerification: CheckVerification) {
    const verificationCode = await this.redis.get(`verificationCode:${checkVerification.email}`);

    if (!verificationCode) {
      throw new NotFoundException('인증시간이 만료되었습니다.');
    } else {
      await this.redis.del(`verificationCode:${checkVerification.email}`);
    }

    if (checkVerification.checkVerificationCode !== verificationCode) {
      throw new UnauthorizedException('인증번호가 일치하지 않습니다.');
    }

    await this.redis.setex(`VerificationCheck:${checkVerification.email}`, 1800, 'true');
    return verificationCode;
  }

  async findUserById(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('해당 유저를 찾을 수 없습니다.');
    };

    return user;
  }

  async signin(signinDto: signinDto) {
    const user = await this.userRepository.findOne({
      where: { email: signinDto.email },
      select: ['id', 'email', 'password']
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 이메일입니다.');
    }

    if (!(await bcrypt.compare(signinDto.password, user.password))) {
      throw new UnauthorizedException("비밀번호가 일치하지 않습니다.");
    }

    return user;
  }

  async findUserWithPassword(id: number) {
    const user = await this.userRepository.findOne({ 
      where: { id },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('해당 유저를 찾을 수 없습니다.');
    }

    return user;
  }

  async editUser(id:number, editUserDto: EditUserDto) {
    const user = await this.findUserWithPassword(id);

    if (!(await bcrypt.compare(editUserDto.password, user.password))) {
      throw new UnauthorizedException("비밀번호가 일치하지 않습니다.");
    } else {
      editUserDto.password = user.password;
    }
    
    if (editUserDto.newPassword) {
      if (editUserDto.newPassword !== editUserDto.newCheckPassword) {
        throw new Error('새 비밀번호가 일치하지 않습니다.');
      }
      const salt = await bcrypt.genSalt();
      editUserDto.password = await bcrypt.hash(editUserDto.newPassword, salt);
    }

    const editUser = await this.userRepository.update(user.id, editUserDto);
    console.log(editUser);
    return editUser;
  }

  async deleteUser(user: User, deleteUserDto: DeleteUserDto) {
    const findUser = await this.findUserWithPassword(user.id);

    if (!(await bcrypt.compare(deleteUserDto.password, findUser.password))) {
      throw new UnauthorizedException("비밀번호가 일치하지 않습니다.");
    }

    user.deletedAt = new Date();
    return await this.userRepository.save(user);
  }

  async findUserByNickName(nickName: string) {
    const user = await this.userRepository.findOneBy({ nickName });

    if (!user) {
      throw new NotFoundException('해당 닉네임의 유저를 찾을 수 없습니다.');
    }

    return user;
  }
}
