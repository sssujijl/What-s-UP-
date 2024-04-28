import _ from 'lodash';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { CreateFoodmateDto } from './dto/create-foodmate.dto';
import { UpdateFoodmateDto } from './dto/update-foodmate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FoodMate } from './entities/foodmate.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Gender } from './types/gender.type';
import { Status } from './types/status.type';
import { ChatRoomsService } from 'src/chat-rooms/chat-rooms.service';
import { User_FoodMate } from './entities/user_foodmates.entity';

@Injectable()
export class FoodmatesService {
  constructor(
    @InjectRepository(FoodMate)
    private foodmateRepository: Repository<FoodMate>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRedis() private readonly redis: Redis,
    private dataSource: DataSource,
    private readonly chatRoomService: ChatRoomsService
  ) {}

  async create(createFoodmateDto: CreateFoodmateDto) {
    const foodmate = await this.foodmateRepository.save(createFoodmateDto);

    return foodmate;
  }

  async findAll(orderBy: string, category?: string, region?: string) {
    let query = this.foodmateRepository
      .createQueryBuilder('foodmate')
      .leftJoinAndSelect('foodmate.userFoodMates', 'userFoodMates')
      .leftJoinAndSelect('foodmate.user', 'user')
      .leftJoinAndSelect('foodmate.foodCategory', 'foodCategory');

    if (category) {
      const categoryIds = await this.redis.smembers(
        `FoodCategory: ${category}`,
      );
      query = query.andWhere('foodCategory.id IN (:...categoryIds)', {
        categoryIds,
      });
    }

    if (region) {
      query = query.andWhere('foodmate.region = :region', { region });
    }

    const foodmates = await query
      .orderBy(
        orderBy === 'views' ? 'foodmate.views' : 'foodmate.createdAt',
        'DESC',
      )
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
      relations: ['foodCategory', 'user'],
    });

    if (!foodMate) {
      throw new NotFoundException('밥친구 게시물을 찾을 수 없습니다.');
    }

    const key = `foodMateId:${id}:userIP:${userIP}`;

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

    const viewsResults = await Promise.all(
      keys.map(async (key) => {
        const foodMateId = key.split(':')[1];
        const views = await this.redis.get(key);
        return { foodMateId, views };
      }),
    );

    await Promise.all(
      viewsResults.map(async (view) => {
        await this.foodmateRepository.update(view.foodMateId, {
          views: +view.views,
        });
      }),
    );

    await Promise.all(keys.map((key) => this.redis.del(key)));
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

  async remove(id: number, user: User) {
    const foodmate = await this.foodmateRepository.findOne({ where: { id } });

    if (!foodmate) {
      throw new NotFoundException('밥친구를 찾을 수 없습니다.');
    } else if (foodmate.userId !== user.id) {
      throw new UnauthorizedException('밥친구를 삭제할 권한이 없습니다.')
    }

    return await this.foodmateRepository.delete({ id });
  }

  async applicationFoodMate(user: User, id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const foodMate = await this.foodmateRepository.findOne({
        where: { id },
        relations: ['user', 'userFoodMates'],
      });

      if (user.id === foodMate.user.id) {
        throw new UnauthorizedException('본인이 작성한 밥친구는 신청이 불가능합니다.');
      }

      if (foodMate.status === Status.RECRUITMENT_COMPLETED) {
        throw new UnauthorizedException('해당 밥친구 모집을 마감했어요.');
      }

      if (foodMate.userFoodMates.length >= +foodMate.capacity) {
        throw new UnauthorizedException(
          '해당 밥친구 모집 정원이 가득 찼습니다.',
        );
      }

      if (foodMate.gender !== Gender.Gender_neutral &&
        user.gender !== foodMate.gender
      ) {
        throw new UnauthorizedException(
          '해당 밥친구를 원하는 조건에 부합하지 않습니다.',
        );
      }

      const ageGroup = +foodMate.age.match(/\d+/)[0];
      const userAge = this.calculateAge(user.birth);
      if (ageGroup > userAge || ageGroup + 10 <= userAge) {
        throw new UnauthorizedException('해당 밥친구를 원하는 조건에 부합하지 않습니다.');
      }

      await queryRunner.manager.save(User_FoodMate, {
        userId: user.id,
        foodMateId: id
      })

      if (+foodMate.capacity + 1 === foodMate.userFoodMates.length) {
        foodMate.status = Status.RECRUITMENT_COMPLETED;
        await queryRunner.manager.save(FoodMate, foodMate);
      }

      await queryRunner.commitTransaction();

      const chatRoom = await this.chatRoomService.createChatRoom(user, foodMate.user, `foodMate: ${foodMate.title}`);

      return chatRoom;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return { message: `${err}` };
    } finally {
      await queryRunner.release();
    }
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    const birthDateInThisYear = new Date(birthDate);

    let age = today.getFullYear() - birthDateInThisYear.getFullYear() + 1;

    if (today < birthDateInThisYear) {
      age--;
    }
    return age;
  }

  async searchFoodMates(data: string) {
    const words = data.split(' ');

    const queryBuilder = this.foodmateRepository.createQueryBuilder('foodmate');

    queryBuilder
    .leftJoinAndSelect('foodmate.userFoodMates', 'userFoodMates')
    .leftJoinAndSelect('foodmate.user', 'user')
    .leftJoinAndSelect('foodmate.foodCategory', 'foodCategory');

    if (words.length === 1) {
      const word = `%${words[0]}%`;
      queryBuilder.where(
        'foodmate.title LIKE :word OR foodmate.content LIKE :word',
        { word },
      );
    } else {
      words.forEach((word, index) => {
        if (index === 0) {
          queryBuilder.where(
            'foodmate.title LIKE :word OR foodmate.content LIKE :word',
            { word: `%${word}%` },
          );
        } else {
          queryBuilder.orWhere(
            'foodmate.title LIKE :word OR foodmate.content LIKE :word',
            { word: `%${word}%` },
          );
        }
      });
    }

    const foodMates = await queryBuilder.getMany();

    if (!foodMates || foodMates.length === 0) {
      throw new NotFoundException('해당 검색어에 일치하는 글이 없습니다.');
    }

    return foodMates;
  }
}
