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
    let messages: any[];
    messages = await this.redis.lrange(roomKey, 0, -1);

    if (messages.length <= 50) {
      const databaseMessages = await this.findAllMessage(chatRoomId);
      messages.push(...databaseMessages);
    }

    return messages.map((message: any) => JSON.parse(message));
  }

  async findAllMessage(chatRoomId: number) {
    const messages = await this.messageRepository.find({
      where: { chatRoomId },
      relations: ['user'],
    });

    if (!messages) {
      throw new NotFoundException('해당 채팅방의 메세지를 찾을 수 없습니다.');
    }

    const formattedMessages = messages.map((message: any) => {
      return JSON.stringify({
        userId: message.user.id,
        user: {
          nickName: message.user.nickName,
        },
        content: message.content,
        createdAt: new Date(message.createdAt).toISOString(),
      });
    });

    return formattedMessages;
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
            userId: parsedMessage.userId,
            chatRoomId: +chatRoomId,
            content: parsedMessage.message,
            createdAt: parsedMessage.currentTime,
          };
          await this.messageRepository.save(newMessage);
        }
        await this.redis.del(roomKey);
      }
    }
  }
}
