import { Module } from '@nestjs/common';
import { MissionsService } from './missions.service';
import { MissionsController } from './missions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mission } from './entities/mission.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { PlacesModule } from 'src/places/places.module';
import { Place } from 'src/places/entities/place.entity';
import { ResStatus } from 'src/reservations/entities/resStatus.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mission, Place, ResStatus]),
    ScheduleModule.forRoot(),
    PlacesModule
  ],
  controllers: [MissionsController],
  providers: [MissionsService],
})
export class MissionsModule {}
