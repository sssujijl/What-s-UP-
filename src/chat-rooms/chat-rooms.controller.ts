import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ChatRoomsService } from './chat-rooms.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { userInfo } from 'os';

@UseGuards(AuthGuard('jwt'))
@Controller('chat-rooms')
export class ChatRoomsController {
  constructor(
    private readonly chatRoomService: ChatRoomsService,
    private readonly userService: UsersService
  ) {}

  @Post()
  async createChatRoom (
    @UserInfo() user: User,
    @Body() data: {userId: number, chatRoomName: string}
  ) {
    try {
      const sub = await this.userService.findUserById(data.userId);
      return await this.chatRoomService.createChatRoom(user, sub, data.chatRoomName)
    } catch (err) {
      return { message: `${err}`}
    }
  }

  @Delete()
  async leaveChatRoom(
    @UserInfo() user: User,
    @Body() data: { chatRoomId: number }
  ) {
    try {
      return await this.chatRoomService.leaveChatRoom(user.id, data.chatRoomId);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @Get()
  async findAllChatRooms(@UserInfo() user: User) {
    try {
      return await this.chatRoomService.findChatRoomsByUserId(user.id);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @Get('/:chatRoomId')
  async findOneChatRoom(@Param('chatRoomdId') chatRoomdId: number) {
    try {
      return await this.chatRoomService.findOneChatRoom(chatRoomdId);
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
