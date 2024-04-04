import { Module } from '@nestjs/common';
import { FoodiesService } from './foodies.service';
import { FoodiesController } from './foodies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Foodie } from './entities/foodie.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([Foodie]),
    ScheduleModule.forRoot()
  ],
  controllers: [FoodiesController],
  providers: [FoodiesService,],
  exports: [FoodiesService],
})
export class FoodiesModule {}
