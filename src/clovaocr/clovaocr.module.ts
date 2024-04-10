import { Module } from '@nestjs/common';
import { ClovaocrController } from './clovaocr.controller';
import { ClovaocrService } from './clovaocr.service';

@Module({
  controllers: [ClovaocrController],
  providers: [ClovaocrService]
})
export class ClovaocrModule {}
