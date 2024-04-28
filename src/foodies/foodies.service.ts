import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { Repository } from 'typeorm';
import { CreateFoodieDto } from './dto/create-foodie.dto';
import { UpdateFoodieDto } from './dto/update-foodie.dto';
import { Foodie } from './entities/foodie.entity';

@Injectable()
export class FoodiesService {
  constructor(
    @InjectRepository(Foodie) private readonly foodieRepository: Repository<Foodie>,
    @InjectRedis() private readonly redis: Redis  
  ) {}

  async findOneById(id: number) {
    const foodie = await this.foodieRepository.findOne({
      where: { id },
      relations: ['foodCategory', 'user']
    });

    if (!foodie) {
      throw new NotFoundException('해당 맛집인을 찾을 수 없습니다.');
    }

    return foodie;
  }

  async createFoodie(createFoodieDto: CreateFoodieDto) {
    return await this.foodieRepository.save(createFoodieDto);
  }

  async findFoodieById(foodieId: number, userIP: any) {
    const Foodie = await this.findOneById(foodieId);

    const key = `foodieId:${foodieId}:userIP:${userIP}`

    const duplicateIp = await this.redis.exists(key);
    if (duplicateIp === 0) {
      await this.redis.incr(`foodie:${foodieId}:views`);
      await this.redis.setex(key, 300, 'visited');
    }
    
    const views = await this.redis.get(`foodie:${foodieId}:views`);
    Foodie.views = +views;

    return Foodie;  
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM, { timeZone: 'Asia/Seoul' })
  async savedFoodieViews() {
    const keys = await this.redis.keys('foodie:*:views');

    const viewsResults = await Promise.all(keys.map(async (key) => {
      const foodieId = key.split(':')[1];
      const views = await this.redis.get(key);
      return { foodieId, views };
    }));

    await Promise.all(viewsResults.map(async (view) => {
      await this.foodieRepository.update(view.foodieId, { views: +view.views });
    }));

    await Promise.all(keys.map(key => this.redis.del(key)));
  }

  async findAllFoodies(orderBy: string, category?: string) {
    let query = this.foodieRepository.createQueryBuilder('foodie')
      .leftJoinAndSelect('foodie.foodieAnswers', 'foodieAnswers')
      .leftJoinAndSelect('foodie.user', 'user')
      .leftJoinAndSelect('foodie.foodCategory', 'foodCategory');

      if (category) {
      const categoryIds = await this.redis.smembers(`FoodCategory: ${category}`);
      console.log(categoryIds);
      query = query.andWhere('foodCategory.id IN (:...categoryIds)', { categoryIds });
    }

    const foodies = await query
      .orderBy(orderBy === 'views' ? 'foodie.views' : 'foodie.createdAt', 'DESC')
      .getMany();

      if (!foodies || foodies.length === 0) {
      throw new NotFoundException('맛집인 게시물을 찾을 수 없습니다.');
    }

    for (const foodie of foodies) {
      const views = await this.redis.get(`foodie:${foodie.id}:views`);
      foodie.views = +views || 0;
    }
    
    return foodies;
  }

  async updateFoodie(foodieId: number, userId: number, updateFoodieDto: UpdateFoodieDto) {
    const foodie = await this.findOneById(foodieId);

    if (foodie.userId !== userId) {
      throw new UnauthorizedException('해당 맛집인을 수정할 권한이 없습니다.')
    } 

    return await this.foodieRepository.update(foodieId, updateFoodieDto);
  }

  async deleteFoodie(foodieId: number, userId: number) {
    const foodie = await this.findOneById(foodieId);

    if (foodie.userId !== userId ) {
      throw new UnauthorizedException('해당 맛집인을 삭제할 권한이 없습니다.');
    }

    foodie.deletedAt = new Date();
    return await this.foodieRepository.save(foodie);
  }
}
