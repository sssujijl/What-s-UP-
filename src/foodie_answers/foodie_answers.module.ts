import { Module } from '@nestjs/common';
import { FoodieAnswersService } from './foodie_answers.service';
import { FoodieAnswersController } from './foodie_answers.controller';

@Module({
  controllers: [FoodieAnswersController],
  providers: [FoodieAnswersService],
})
export class FoodieAnswersModule {}
