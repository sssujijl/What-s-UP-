import { Module } from '@nestjs/common';
import { RecommendService } from './recommend.service';
import { RecommendController } from './recommend.controller';
import { Review } from 'src/reviews/entities/review.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from 'src/places/entities/place.entity';
import { FoodCategory } from 'src/places/entities/foodCategorys.entity';
import { ResStatus } from 'src/reservations/entities/resStatus.entity';
import { Reservation } from 'src/reservations/entities/reservation.entity';
import { PlaceList } from 'src/place-lists/entities/place-list.entity';
import { Saved_Place } from 'src/place-lists/entities/savedPlaces.entity';
import { PlaceListsService } from 'src/place-lists/place-lists.service';
import { ReservationsService } from 'src/reservations/reservations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Review,
      Place,
      FoodCategory,
      ResStatus,
      Reservation,
      PlaceList,
      Saved_Place,
    ]),
  ],
  controllers: [RecommendController],
  providers: [RecommendService, ReservationsService, PlaceListsService],
})
export class RecommendModule {}
