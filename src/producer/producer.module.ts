import { Module } from '@nestjs/common';
import { MessageProducer } from './producer.service';

@Module({
  providers: [MessageProducer],
  exports: [MessageProducer],
})
export class ProducerModule {}
