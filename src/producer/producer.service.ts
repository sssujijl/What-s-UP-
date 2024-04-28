import { Injectable } from '@nestjs/common';
import { SNS } from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class MessageProducer {
    private readonly sns: SNS;

    constructor() {
        this.sns = new SNS({
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });
    }

    async sendMessage(body: any) {
        try {
            const message: any = JSON.stringify(body);

            const params = {
                Message: message,
                TopicArn: process.env.SNS_TOPIC_ARN
            };

            await this.sns.publish(params).promise();
            console.log('Message published to SNS successfully.');
        } catch (error) {
            console.log('Error publishing message to SNS:', error);
        }
    }

    async subscriblePhoneToTopic(phone: string) {
        const params = {
            Protocol: 'sms',
            TopicArn: process.env.SNS_TOPIC_ARN,
            Endpoint: `+82${phone}`
        };

        await this.sns.subscribe(params).promise();
        console.log(`Phone number ${phone} subscribed to SNS topic.`);
    }
}