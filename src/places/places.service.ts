import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { Like, Repository } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async findPlaceById(placeId: number) {
    const place = await this.placeRepository.findOneBy({ id: placeId });

    if (!place) {
      throw new NotFoundException('해당 장소를 찾을 수 없습니다.');
    }

    return place;
  }

  async findAllPlace(address: string, category?: string) {
    const placeIds = await this.placesByDong(address);
    
    const categoryIds = category ? await this.redis.smembers(`FoodCategory: ${category}`) : null;

    const query = this.placeRepository
      .createQueryBuilder('place')
      .where('place.id IN (:...ids)', { ids: placeIds })
      .leftJoinAndSelect('place.foodCategory', 'foodCategory')
      .leftJoinAndSelect('place.reviews', 'reviews');

    if (categoryIds) {
      query.andWhere('place.foodCategory IN (:...categoryIds)', {
        categoryIds,
      });
    }

    const places = await query.getMany();

    if (!places) {
      throw new NotFoundException('장소들을 찾을 수 없습니다.');
    }

    return places;
  }

  private async placesByDong(address: string) {
    if (address === '부성2동') {
      address = '두정동';
    }

    const places = await this.redis.smembers(`PlaceIds: ${address}`);

    return places;
  }

  async findAllFoodCategory() {
    const keys = await this.redis.keys('FoodCategory:*');
    const mainCategory: { [key: string]: string[] } = {};

    await Promise.all(
      keys.map(async (key) => {
        const category = key.replace('FoodCategory: ', '');
        const foodCategoryId = await this.redis.smembers(key);
        mainCategory[category] = foodCategoryId;
      }),
    );

    return mainCategory;
  }

  async searchPlaces(data: string) {
    const words = data.split(' ');

    const queryBuilder = this.placeRepository.createQueryBuilder('place');

    queryBuilder.leftJoinAndSelect('place.foodCategory', 'foodCategory');
    queryBuilder.leftJoinAndSelect('place.reviews', 'reviews');

    if (words.length === 1) {
      const word = `%${words[0]}%`;
      queryBuilder.where(
        'place.title LIKE :word OR place.address LIKE :word OR place.roadAddress LIKE :word',
        { word },
      );
    } else {
      words.forEach((word, index) => {
        if (index === 0) {
          queryBuilder.where(
            'place.title LIKE :word OR place.address LIKE :word OR place.roadAddress LIKE :word',
            { word: `%${word}%` },
          );
        } else {
          queryBuilder.orWhere(
            'place.title LIKE :word OR place.address LIKE :word OR place.roadAddress LIKE :word',
            { word: `%${word}%` },
          );
        }
      });
    }

    const places = await queryBuilder.getMany();

    if (!places) {
      throw new NotFoundException('해당 검색어에 일치하는 가게가 없습니다.');
    }

    return places;
  }
}
