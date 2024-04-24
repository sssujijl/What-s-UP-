import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { User } from 'src/users/entities/user.entity';
import { format } from 'date-fns';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async findAllMessageFromRedis(chatRoomId: number) {
    const roomKey = `ChatRoom:${chatRoomId}`;
    const messages = await this.redis.lrange(roomKey, 0, -1);

    if (!messages) {
      return await this.findAllMessage(chatRoomId);
    }

    const modifiedMessages = messages.map((message: any) => {
      const parsedMessage = JSON.parse(message);

      parsedMessage.currentTime = format(
        new Date(parsedMessage.currentTime),
        'a hh:mm',
      );
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

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleSaveMessage() {
    const roomKeys = await this.redis.keys(`ChatRoom:*`);

    for (const roomKey of roomKeys) {
      const chatRoomId = roomKey.match(/\d+$/)[0];
      const messages = await this.redis.lrange(roomKey, 0, -1);

      if (messages && messages.length > 0) {
        for (const message of messages) {
          const parsedMessage = JSON.parse(message);
          const newMessage = {
            userId : parsedMessage.userId,
            chatRoomId : +chatRoomId,
            content : parsedMessage.message,
            createdAt : parsedMessage.currentTime,
          }
          await this.messageRepository.save(newMessage);
        }
        await this.redis.del(roomKey);
      }
    }
  }
}
