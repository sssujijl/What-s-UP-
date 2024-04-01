import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place) private readonly placeRepository: Repository<Place>
  ) {}

  async findPlaceById(placeId: number) {
    const place = await this.placeRepository.findOneBy({ id: placeId });

    if (!place) {
      throw new NotFoundException('해당 장소를 찾을 수 없습니다.');
    }

    return place;
  }
}
