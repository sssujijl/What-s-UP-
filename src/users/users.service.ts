import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from "bcryptjs";
import { PointsService } from 'src/points/points.service';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private dataSource: DataSource,
    private readonly pointService: PointsService,
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

      const user = await queryRunner.manager.save(User, signupDto);

      await this.pointService.createPoint(user.id, 3000);

      await queryRunner.commitTransaction();
      return user;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return { message: `${err}` }
    } finally {
      await queryRunner.release();
    }
  }
}
