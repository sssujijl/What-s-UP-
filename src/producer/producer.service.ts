import { Injectable } from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';
import dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class MessageProducer {
    constructor(private readonly sqsService: SqsService) {}

    async sendMessage(body: any) {

        const message: any = JSON.stringify(body);

        try {
            await this.sqsService.send(process.env.QUEUE_URL, message);
        } catch (error) {
            console.log('error in producing image!', error);
        }

    }
}