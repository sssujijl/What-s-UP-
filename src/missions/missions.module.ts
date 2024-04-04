import { Module } from '@nestjs/common';
import { MissionsService } from './missions.service';
import { MissionsController } from './missions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mission } from './entities/mission.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { PlacesService } from 'src/places/places.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mission]),
    ScheduleModule.forRoot(),
    PlacesService
  ],
  controllers: [MissionsController],
  providers: [MissionsService],
})
export class MissionsModule {}
