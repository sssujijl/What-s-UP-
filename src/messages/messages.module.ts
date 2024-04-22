import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { ChatRoomsModule } from 'src/chat-rooms/chat-rooms.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), ChatRoomsModule],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService]
})
export class MessagesModule {}
