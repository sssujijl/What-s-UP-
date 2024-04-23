import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ChatRoomsService } from 'src/chat-rooms/chat-rooms.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/users/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('/chatRoom/:chatRoomId/messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly chatRoomService: ChatRoomsService
  ) {}

  @Get()
  async findAllMessage(
    @UserInfo() user: User,
    @Param('chatRoomId') chatRoomId: number
  ) {
    try {
      await this.chatRoomService.findOneChatRoom(chatRoomId);
      return await this.messagesService.findAllMessageFromRedis(chatRoomId);
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
