import { Module } from '@nestjs/common';
import { FoodmatesService } from './foodmates.service';
import { FoodmatesController } from './foodmates.controller';

@Module({
  controllers: [FoodmatesController],
  providers: [FoodmatesService],
})
export class FoodmatesModule {}
