import { Body, Controller, Delete, Get, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { userInfo } from 'os';
import { ChatRoomsService } from './chat-rooms.service';

@UseGuards(AuthGuard('jwt'))
@Controller('chatrooms')
export class ChatRoomsController {
  constructor(
    private readonly chatRoomService: ChatRoomsService,
    private readonly userService: UsersService
  ) {}

  @Post()
  async createChatRoom (
    @UserInfo() user: User,
    @Body() body: {userId: number, chatRoomName: string}
  ) {
    try {
      const sub = await this.userService.findUserById(body.userId);
      const data = await this.chatRoomService.createChatRoom(user, sub, body.chatRoomName)
      return {
        statusCode: HttpStatus.OK,
        message: '채팅방이 성공적으로 생성되었습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}`}
    }
  }

  @Delete()
  async leaveChatRoom(
    @UserInfo() user: User,
    @Body() body: { chatRoomId: number }
  ) {
    try {
      const data = await this.chatRoomService.leaveChatRoom(user.id, body.chatRoomId);
      return {
        statusCode: HttpStatus.OK,
        message: '채팅방이 성공적으로 삭제되었습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @Get()
  async findAllChatRooms(@UserInfo() user: User) {
    try {
      const data = await this.chatRoomService.findChatRoomsByUserId(user.id);
      return {
        statusCode: HttpStatus.OK,
        message: '모든 채팅방을 성공적으로 조회하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @Get('/:chatRoomId')
  async findOneChatRoom(
    @Param('chatRoomdId') chatRoomdId: number,
    @UserInfo() user: User
  ) {
    try {
      const data =  await this.chatRoomService.findOneChatRoom(chatRoomdId, user.id);
      return {
        statusCode: HttpStatus.OK,
        message: '채팅방을 성공적으로 조회하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
