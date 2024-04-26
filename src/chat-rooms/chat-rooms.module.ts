import { Module } from '@nestjs/common';
import { ChatService } from './chat-rooms.service';
import { ChatRoomsController } from './chat-rooms.controller';

@Module({
  controllers: [ChatRoomsController],
  providers: [ChatService],
})
export class ChatRoomsModule {}
