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
    const foodie = await this.foodieRepository.findOneBy({ id });

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
    //---------------------------------------------------
    const keys = await this.redis.keys('foodie:*:views');

    const viewsResults = await Promise.all(keys.map(async (key) => {
      const foodieId = key.split(':')[1];
      const views = await this.redis.get(key);
      return { foodieId, views };
    }));

    console.log(viewsResults);

    return Foodie;  
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM, { timeZone: 'Asia/Seoul' })
  async savedFoodieViews() {
    const foodiesViews = await this.redis.keys('foodie:*:views');
  }

  async moveViewsFromRedisToDatabase() {
    // Redis에서 모든 음식의 조회수 가져오기
    const keys = await this.redis.keys('foodie:*:views');
    const viewsPromises = keys.map(async key => {
        const foodieId = key.split(':')[1];
        const views = await this.redis.get(key);
        return { foodieId, views: parseInt(views) };
    });
    const views = await Promise.all(viewsPromises);

    // 데이터베이스에 조회수 저장
    await Promise.all(views.map(async view => {
        await this.foodieRepository.update(view.foodieId, { views: view.views });
    }));

    // Redis 데이터 삭제
    await Promise.all(keys.map(key => this.redis.del(key)));
}

  async findAllFoodies() {
    const foodie = await this.foodieRepository.find();

    if (!foodie) {
      throw new NotFoundException('맛집인 게시물을 찾을 수 없습니다.');
    }

    return foodie;
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
