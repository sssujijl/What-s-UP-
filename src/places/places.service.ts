import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { Repository } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place) private readonly placeRepository: Repository<Place>,
    @InjectRedis() private readonly redis: Redis
  ) {}

  async findPlaceById(placeId: number) {
    const place = await this.placeRepository.findOneBy({ id: placeId });

    if (!place) {
      throw new NotFoundException('해당 장소를 찾을 수 없습니다.');
    }

    return place;
  }

  async findAllPlace(address: string) {
    const placeIds = await this.placesByDong(address);

    const places = await Promise.all(placeIds.map(async (placeId) => {
        return await this.placeRepository.findOne({
            where: { id: +placeId },
            relations: ['foodCategory', 'reviews']
        });
    }));

    if (!places || places.length === 0) {
        throw new NotFoundException('장소들을 찾을 수 없습니다.');
    }

    return places;
}

  private async placesByDong(address: string) {
    let dong = '두정동';

    const places = await this.redis.smembers(`PlaceIds: ${dong}`);

    return places;
  }
}
