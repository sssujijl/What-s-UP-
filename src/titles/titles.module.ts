import { Module } from '@nestjs/common';
import { TitlesService } from './titles.service';
import { TitlesController } from './titles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodiesModule } from 'src/foodies/foodies.module';
import { Title } from './entities/titles.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Title]), FoodiesModule],
  controllers: [TitlesController],
  providers: [TitlesService],
  exports: [TitlesService]
})
export class TitlesModule {}
