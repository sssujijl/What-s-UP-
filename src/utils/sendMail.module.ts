import { Module } from '@nestjs/common';
import { sendMail } from './sendmail.service';

@Module({
  providers: [sendMail],
  exports: [sendMail], // 다른 모듈에서 sendMail 사용할 수 있도록 내보냅니다.
})
export class MailModule {}
