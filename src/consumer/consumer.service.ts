import { Injectable } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import * as AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class MessageHandler {
    constructor() { }
    @SqsMessageHandler(process.env.QUEUE_URL, false)
    async handleMessage(message: AWS.SQS.Message) {
        const obj: any = JSON.parse(message.Body) as {
            message: string;
            date: string;
        };
        const { data } = JSON.parse(obj.Message);

        // use the data and consume it the way you want // 

    }
}