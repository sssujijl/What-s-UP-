import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatRoom } from './entites/chat-room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User_ChatRoom } from './entites/user-chatRoom.entity';
import { EventsGateway } from 'src/event-gateway/events.gateway';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ChatRoomsService {
  constructor(
    @InjectRepository(ChatRoom) private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(User_ChatRoom) private readonly userChatRoomRepositroy: Repository<User_ChatRoom>,
    private dataSource: DataSource,
    private eventGateway: EventsGateway
  ) {}

  async createChatRoom(pub: User, sub: User, chatRoomName: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const chatRoom = await queryRunner.manager.save(ChatRoom, { name: chatRoomName });

      await queryRunner.manager.save(User_ChatRoom, [
        { chatRoomId: chatRoom.id, userId: pub.id },
        { chatRoomId: chatRoom.id, userId: sub.id },
      ]);

      await this.eventGateway.createRoomJoin(chatRoom, pub, sub);

      await queryRunner.commitTransaction();

      return chatRoom;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return { message: `${err}` }
    } finally {
      await queryRunner.release();
    }
  }

  async leaveChatRoom(userId: number, chatRoomdId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userChatRoom = await this.findOneUserChatRoom(userId, chatRoomdId);

      await queryRunner.manager.delete(User_ChatRoom, userChatRoom);

      await this.eventGateway.leaveChatRoom(userChatRoom);

      await queryRunner.commitTransaction();

      return userChatRoom;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return { message: `${err}` }
    } finally {
      await queryRunner.release();
    }
  }

  async findOneUserChatRoom(userId: number, chatRoomId: number) {
    const userChatRoom = await this.userChatRoomRepositroy.findOne({
      where: { userId, chatRoomId },
      relations: ['user']
    });

    if (!userChatRoom) {
      throw new NotFoundException('해당 유저의 채팅방을 찾을 수 없습니다.');
    }

    return userChatRoom;
  }
}
