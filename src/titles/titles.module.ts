import { Module } from '@nestjs/common';
import { TitlesService } from './titles.service';
import { TitlesController } from './titles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Foodie } from 'src/foodies/entities/foodie.entity';
import { Foodie_Answer } from 'src/foodie_answers/entities/foodie_answer.entity';
import { FoodiesModule } from 'src/foodies/foodies.module';

@Module({
  imports: [TypeOrmModule.forFeature([Foodie, Foodie_Answer]), FoodiesModule],
  controllers: [TitlesController],
  providers: [TitlesService],
})
export class TitlesModule {}
