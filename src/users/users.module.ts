import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { SendMailService } from 'src/users/sendMail.service';
import { BullModule } from '@nestjs/bull';
import { MailerConsumer } from './mailer.consumer';
import { ProducerModule } from 'src/producer/producer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    BullModule.registerQueue({
      name: 'mailerQueue'
    }),
    forwardRef(() => AuthModule),
    ProducerModule
  ],
  controllers: [UsersController],
  providers: [UsersService, SendMailService, MailerConsumer],
  exports: [UsersService, SendMailService],
})
export class UsersModule {}
