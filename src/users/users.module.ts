import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PointsModule } from 'src/points/points.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), PointsModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
