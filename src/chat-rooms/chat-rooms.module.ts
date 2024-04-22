import { Module } from '@nestjs/common';
import { ChatRoomsController } from './chat-rooms.controller';
import { ChatRoomsService } from './chat-rooms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './entites/chat-room.entity';
import { User_ChatRoom } from './entites/user-chatRoom.entity';
import { EventGatewayModule } from 'src/event-gateway/event-gateway.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom, User_ChatRoom]),
    EventGatewayModule,
    UsersModule
  ],
  controllers: [ChatRoomsController],
  providers: [ChatRoomsService],
  exports: [ChatRoomsService]
})
export class ChatRoomsModule {}
