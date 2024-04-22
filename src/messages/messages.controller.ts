import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { GetMessagesDto } from './dto/get-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  getMessages(@Query() getMessagesDto: GetMessagesDto) {
    return this.messagesService.getMessages(getMessagesDto);
  }

  @Post()
  createMessages(@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.createMessage(createMessageDto);
  }
}
