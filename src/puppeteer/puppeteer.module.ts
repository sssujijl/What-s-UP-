import { Module } from '@nestjs/common';
import { PuppeteerService } from './puppeteer.service';
import { PuppeteerController } from './puppeteer.controller';
import { FoodCategory } from 'src/places/entities/foodCategorys.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from 'src/places/entities/place.entity';
import { Menu } from 'src/menus/entities/menu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FoodCategory, Place, Menu])],
  controllers: [PuppeteerController],
  providers: [PuppeteerService],
})
export class PuppeteerModule {}
