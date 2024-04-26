import { OnQueueCompleted, OnQueueError, OnQueueFailed, Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { SendMailService } from "./sendMail.service";

@Processor('mailerQueue')
export class MailerConsumer {
    constructor(
        private readonly sendMailerService: SendMailService
    ) {}

    @Process('mailer')
    async getMailerQueue(job: Job) {
        const mailer = await this.sendMailerService.sendVerificationCode(
            job.data.emailer
        );
    }

    @OnQueueCompleted()
    async A () {
        console.log('------성공');
    }

    @OnQueueFailed()
    failHandler(job: Job, err: Error) {
      console.log('OnQueueFailed');
      throw err;
    }
  
    @OnQueueError()
    errorHandler(err: Error) {
      console.log('OnQueueError');
      throw err;
    }
}