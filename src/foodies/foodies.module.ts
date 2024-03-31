import { Module } from '@nestjs/common';
import { FoodiesService } from './foodies.service';
import { FoodiesController } from './foodies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Foodie } from './entities/foodie.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Foodie])],
  controllers: [FoodiesController],
  providers: [FoodiesService],
  exports: [FoodiesService],
})
export class FoodiesModule {}
