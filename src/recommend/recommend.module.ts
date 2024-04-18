import { Module } from '@nestjs/common';
import { RecommendService } from './recommend.service';
import { RecommendController } from './recommend.controller';
import { Review } from 'src/reviews/entities/review.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from 'src/places/entities/place.entity';
import { FoodCategory } from 'src/places/entities/foodCategorys.entity';
import { ResStatus } from 'src/reservations/entities/resStatus.entity';
import { Reservation } from 'src/reservations/entities/reservation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Review,
      Place,
      FoodCategory,
      ResStatus,
      Reservation,
    ]),
  ],
  controllers: [RecommendController],
  providers: [RecommendService],
})
export class RecommendModule {}
