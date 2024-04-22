import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ChatRoomsService } from './chat-rooms.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/users/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('chat-rooms')
export class ChatRoomsController {
  constructor(private readonly chatRoomService: ChatRoomsService) {}

//   @Get()
//   getRooms(getRoomsDto: GetRoomsDto) {
//     return this.chatRoomService.getRooms(getRoomsDto);
//   }

//   @Get(':id')
//   getRoom(@Param('id', ParseIntPipe) id: number) {
//     return this.chatRoomService.getRoom(id);
//   }

//   @Get('search')
//   searchRooms(@Query() searchRoomsDto: SearchRoomsDto) {
//     return this.chatRoomService.searchRooms(searchRoomsDto);
//   }

//   @Post()
//   createRoom(@UserInfo() user: User, @Body() createRoomDto: CreateRoomDto) {
//     return this.chatRoomService.createRoom(createRoomDto, user.id);
//   }

//   @Put(':id')
//   updateRoom(
//     @UserInfo() user: User,
//     @Param('id', ParseIntPipe) id: number,
//     @Body() updateRoomDto: UpdateRoomDto,
//   ) {
//     return this.chatRoomService.updateRoom(id, updateRoomDto, user.id);
//   }

//   @Delete(':id')
//   deleteRoom(
//     @UserInfo() user: User,
//     @Param('id', ParseIntPipe) id: number,
//   ) {
//     return this.chatRoomService.deleteRoom(id, user.id);
//   }
}
