import { Injectable } from '@nestjs/common';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { UpdateChatRoomDto } from './dto/update-chat-room.dto';
import Redis from 'ioredis';

@Injectable()
export class ChatService {
  constructor(private readonly redis: Redis) {}

  async saveMessage(userId: string, message: string): Promise<void> {
    await this.redis.getClient().set(userId, message);
  }

  async getMessage(userId: string): Promise<string | null> {
    return await this.redis.getClient().get(userId);
  }
}
