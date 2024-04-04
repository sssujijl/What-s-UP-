import { Module } from '@nestjs/common';
import { FoodmatesService } from './foodmates.service';
import { FoodmatesController } from './foodmates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { FoodMate } from './entities/foodmate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, FoodMate])],
  controllers: [FoodmatesController],
  providers: [FoodmatesService],
})
export class FoodmatesModule {}
