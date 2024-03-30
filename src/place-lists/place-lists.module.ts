import { Module } from '@nestjs/common';
import { PlaceListsService } from './place-lists.service';
import { PlaceListsController } from './place-lists.controller';

@Module({
  controllers: [PlaceListsController],
  providers: [PlaceListsService],
})
export class PlaceListsModule {}
