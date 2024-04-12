import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { SendMailService } from 'src/users/sendMail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), 
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, SendMailService],
  exports: [UsersService],
})
export class UsersModule {}
