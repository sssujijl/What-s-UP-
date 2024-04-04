import { Module, forwardRef } from '@nestjs/common';
import { PlaceListsService } from './place-lists.service';
import { PlaceListsController } from './place-lists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceList } from './entities/place-list.entity';
import { Saved_Place } from './entities/savedPlaces.entity';
import { PlacesModule } from 'src/places/places.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlaceList, Saved_Place]), 
    PlacesModule,
    forwardRef(() => UsersModule)
  ],
  controllers: [PlaceListsController],
  providers: [PlaceListsService],
  exports: [PlaceListsService]
})
export class PlaceListsModule {}
