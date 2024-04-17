import { Injectable } from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';
import dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class MessageProducer {
    constructor(private readonly sqsService: SqsService) {}

    async sendMessage(body: any) {
        try {
            
            const message: any = JSON.stringify(body);

            await this.sqsService.send(process.env.QUEUE_NAME, {
                id: 'id',
                body: message
            });
        } catch (error) {
            console.log('error in producing image!', error);
        }
    }
}
