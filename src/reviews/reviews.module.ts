import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { PlacesModule } from 'src/places/places.module';
import { TitlesModule } from 'src/titles/titles.module';
import { ReservationsModule } from 'src/reservations/reservations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]), 
    PlacesModule,
    TitlesModule,
    ReservationsModule
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService]
})
export class ReviewsModule {}
