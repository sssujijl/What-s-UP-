import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { User } from 'src/users/entities/user.entity';
import { format } from 'date-fns';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRedis() private readonly redis: Redis
  ) {}

  async findAllMessageFromRedis(user: User, chatRoomId: number) {
    const roomKey = `ChatRoom:${chatRoomId}`;
    const messages = await this.redis.lrange(roomKey, 0, -1);
  
    if (!messages) {
      throw new NotFoundException('해당 채팅방의 메세지를 찾을 수 없습니다.');
    }
  
    const modifiedMessages = messages.map((message: any) => {
      const parsedMessage = JSON.parse(message);
      if (parsedMessage.userId === user.id) {
        parsedMessage.userId = 'me';
      }
      // Format the time in AM/PM format
      parsedMessage.currentTime = format(new Date(parsedMessage.currentTime), "a hh:mm");
      return parsedMessage;
    });
  
    return modifiedMessages;
  }

  async findAllMessage(chatRoomId: number) {
    const messages = await this.messageRepository.findBy({ chatRoomId });

    if (!messages) {
      throw new NotFoundException('해당 채팅방의 메세지를 찾을 수 없습니다.');
    }

    return messages;
  }
}
