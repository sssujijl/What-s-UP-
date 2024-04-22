import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetMessagesDto } from './dto/get-message.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  getMessages(getMessagesDto: GetMessagesDto) {
    return this.messageRepository.findBy({
    });
  }

  async createMessage(createMessageDto: CreateMessageDto) {
    const message = this.messageRepository.create(createMessageDto);
    await this.messageRepository.save(message);
    return message;
  }
}
