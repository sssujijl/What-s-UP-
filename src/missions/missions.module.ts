import { Module } from '@nestjs/common';
import { MissionsService } from './missions.service';
import { MissionsController } from './missions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mission } from './entities/mission.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { PlacesModule } from 'src/places/places.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mission]),
    ScheduleModule.forRoot(),
    PlacesModule
  ],
  controllers: [MissionsController],
  providers: [MissionsService],
})
export class MissionsModule {}
