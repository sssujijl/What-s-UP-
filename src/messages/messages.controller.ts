import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ChatRoomsService } from 'src/chat-rooms/chat-rooms.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/users/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Messages')
@UseGuards(AuthGuard('jwt'))
@Controller('/chatRoom/:chatRoomId/messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly chatRoomService: ChatRoomsService
  ) {}

  /**
   * 모든 메세지 조회
   * @param chatRoomId
   * @returns
   */
  @Get()
  async findAllMessage(
    @UserInfo() user: User,
    @Param('chatRoomId') chatRoomId: number
  ) {
    try {
      await this.chatRoomService.findOneChatRoom(chatRoomId, user.id);
      const data = await this.messagesService.findAllMessageFromRedis(chatRoomId);
      return {
        statusCode: HttpStatus.OK,
        message: '메세지를 성공적으로 조회하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
