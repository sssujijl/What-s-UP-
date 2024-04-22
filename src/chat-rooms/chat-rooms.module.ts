import { Module } from '@nestjs/common';
import { ChatRoomsController } from './chat-rooms.controller';
import { ChatRoomsService } from './chat-rooms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './entites/chat-room.entity';
import { User_ChatRoom } from './entites/user-chatRoom.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoom, User_ChatRoom])],
  controllers: [ChatRoomsController],
  providers: [ChatRoomsService]
})
export class ChatRoomsModule {}
