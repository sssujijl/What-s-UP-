import { Module } from '@nestjs/common';
import { FoodiesService } from './foodies.service';
import { FoodiesController } from './foodies.controller';

@Module({
  controllers: [FoodiesController],
  providers: [FoodiesService],
})
export class FoodiesModule {}
