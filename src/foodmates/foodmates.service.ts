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
import { Cron, CronExpression } from '@nestjs/schedule';

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

  async findAll(orderBy: string, category?: string, region?: string) {
    let query = this.foodmateRepository.createQueryBuilder('foodmate')
      .leftJoinAndSelect('foodmate.userFoodMates', 'userFoodMates')
      .leftJoinAndSelect('foodmate.user', 'user')
      .leftJoinAndSelect('foodmate.foodCategory', 'foodCategory');
  
    if (category) {
      const categoryIds = await this.redis.smembers(`FoodCategory: ${category}`);
      query = query.andWhere('foodCategory.id IN (:...categoryIds)', { categoryIds });
    }

    if (region) {
      query = query.andWhere('foodmate.region = :region', { region });
    }
  
    const foodmates = await query
      .orderBy(orderBy === 'views' ? 'foodmate.views' : 'foodmate.createdAt', 'DESC')
      .getMany();
  
    if (!foodmates || foodmates.length === 0) {
      throw new NotFoundException('음식친구 게시물을 찾을 수 없습니다.');
    }

    for (const foodmate of foodmates) {
      const views = await this.redis.get(`foodMate:${foodmate.id}:views`);
      foodmate.views = +views || 0;
    }

    return foodmates;
  }  

  async findOne(id: number, userIP: string) {
    const foodMate = await this.foodmateRepository.findOne({ 
      where: { id },
      relations: ['foodCategory', 'user']
    });

    if (!foodMate) {
      throw new NotFoundException('밥친구 게시물을 찾을 수 없습니다.');
    }

    const key = `foodMateId:${id}:userIP:${userIP}`

    const duplicateIp = await this.redis.exists(key);
    if (duplicateIp === 0) {
      await this.redis.incr(`foodMate:${id}:views`);
      await this.redis.setex(key, 300, 'visited');
    }
    
    const views = await this.redis.get(`foodMate:${id}:views`);
    foodMate.views = +views;

    return foodMate;  
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM, { timeZone: 'Asia/Seoul' })
  async savedFoodmatesViews() {
    const keys = await this.redis.keys('foodMate:*:views');

    const viewsResults = await Promise.all(keys.map(async (key) => {
      const foodMateId = key.split(':')[1];
      const views = await this.redis.get(key);
      return { foodMateId, views };
    }));

    await Promise.all(viewsResults.map(async (view) => {
      await this.foodmateRepository.update(view.foodMateId, { views: +view.views });
    }));

    await Promise.all(keys.map(key => this.redis.del(key)));
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
