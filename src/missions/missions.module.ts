import { Module } from '@nestjs/common';
import { MissionsService } from './missions.service';
import { MissionsController } from './missions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mission } from './entities/mission.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { PlacesModule } from 'src/places/places.module';
import { Place } from 'src/places/entities/place.entity';
import { ResStatus } from 'src/reservations/entities/resStatus.entity';
import * as AWS from 'aws-sdk';
import dotenv from 'dotenv';
import { ProducerModule } from 'src/producer/producer.module';

dotenv.config();

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

@Module({
  imports: [
    TypeOrmModule.forFeature([Mission, Place, ResStatus]),
    ScheduleModule.forRoot(),
    PlacesModule,
    ProducerModule
  ],
  controllers: [MissionsController],
  providers: [MissionsService],
})
export class MissionsModule {}
