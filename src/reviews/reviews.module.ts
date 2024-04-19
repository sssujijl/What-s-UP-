import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { PlacesModule } from 'src/places/places.module';
import { TitlesModule } from 'src/titles/titles.module';
import { ReservationsModule } from 'src/reservations/reservations.module';
import { BullModule } from '@nestjs/bull';
import { Mission } from 'src/missions/entities/mission.entity';
import { MissionsService } from 'src/missions/missions.service';
import { Place } from 'src/places/entities/place.entity';
import { ResStatus } from 'src/reservations/entities/resStatus.entity';
import { MessageProducer } from 'src/producer/producer.service';
import { Reservation } from 'src/reservations/entities/reservation.entity';
import { MissionReviewProcessor } from './mission-review.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mission-review',
    }),
    TypeOrmModule.forFeature([Review, Mission, Place, ResStatus, Reservation]),
    PlacesModule,
    TitlesModule,
    ReservationsModule,
  ],
  controllers: [ReviewsController],
  providers: [
    ReviewsService,
    MissionsService,
    MessageProducer,
    MissionReviewProcessor,
  ],
  exports: [ReviewsService],
})
export class ReviewsModule {}
