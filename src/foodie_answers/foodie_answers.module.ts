import { Module } from '@nestjs/common';
import { FoodieAnswersService } from './foodie_answers.service';
import { FoodieAnswersController } from './foodie_answers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Foodie_Answer } from './entities/foodie_answer.entity';
import { FoodiesModule } from 'src/foodies/foodies.module';
import { UsersModule } from 'src/users/users.module';
import { TitlesModule } from 'src/titles/titles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Foodie_Answer]), 
    FoodiesModule,
    TitlesModule
  ],
  controllers: [FoodieAnswersController],
  providers: [FoodieAnswersService],
})
export class FoodieAnswersModule {}
