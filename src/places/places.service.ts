import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findAllPlace() {
    const places = await this.placeRepository.find();

    if (!places) {
      throw new NotFoundException('장소들을 찾을  수 없습니다.');
    }

    return places;
  }
}
