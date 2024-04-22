import _ from 'lodash';
import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateFoodmateDto } from './dto/create-foodmate.dto';
import { UpdateFoodmateDto } from './dto/update-foodmate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FoodMate } from './entities/foodmate.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class FoodmatesService {
  constructor(
    @InjectRepository(FoodMate)
    private foodmateRepository: Repository<FoodMate>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRedis() private readonly redis: Redis  
  ) {}

  async create(createFoodmateDto: CreateFoodmateDto) {
    const foodmate = await this.foodmateRepository.save(createFoodmateDto);

    return foodmate;
  }

  async findAll(orderBy: string, category?: string) {
    let query = this.foodmateRepository.createQueryBuilder('foodmate')
      .leftJoinAndSelect('foodmate.userFoodMates', 'userFoodMates')
      .leftJoinAndSelect('foodmate.foodCategory', 'foodCategory');

    if (category) {
      const categoryIds = await this.redis.smembers(`FoodCateogry: ${category}`);
      query = query.andWhere('foodCategory.id IN (:...categoryIds)', { categoryIds });
    }

    const foodmates = await query
      .orderBy(orderBy === 'views' ? 'foodmate.views' : 'foodmate.createdAt', 'DESC')
      .getMany();

    if (!foodmates || foodmates.length === 0) {
      throw new NotFoundException('음식친구 게시물을 찾을 수 없습니다.');
    }

    return foodmates;
  }


  async findOne(id: number) {
    return await this.foodmateRepository.findOne({ where: { id } });
  }

  async update(id: number, updateFoodmateDto: UpdateFoodmateDto) {
    const { content, gender, age, region, dateTime, capacity, status } =
      updateFoodmateDto;
    const foodmate = await this.foodmateRepository.findOne({ where: { id } });
    if (!foodmate) {
      throw new NotFoundException('밥친구를 찾을 수 없습니다.');
    }

    return await this.foodmateRepository.update(id, {
      content,
      gender,
      age,
      region,
      dateTime,
      capacity,
      status,
    });
  }

  async remove(id: number) {
    const foodmate = await this.foodmateRepository.findOne({ where: { id } });
    if (!foodmate) {
      throw new NotFoundException('밥친구를 찾을 수 없습니다.');
    }

    return this.foodmateRepository.delete({ id });
  }
}
