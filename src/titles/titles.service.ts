import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Title } from './entities/titles.entity';
import { Level } from './types/level.type';

@Injectable()
export class TitlesService {
  constructor (
    @InjectRepository(Title) private readonly titleRepository: Repository<Title>,
  ) {}
  
  async givenTitle(userId: number, foodCategoryId: number, count: number) {
    const title = await this.findTitle(userId, foodCategoryId);

    if (!title) {
      return await this.titleRepository.save({ userId, foodCategoryId });
    }

    const newTitle = await this.upgradeTitle(title, count);
    return await this.titleRepository.update(title.id, newTitle);
  }

  async findTitle(userId: number, foodCategoryId: number) {
    const title = await this.titleRepository.findOneBy({ userId, foodCategoryId });

    return title;
  }

  async upgradeTitle(title: Title, count: number) {
    if (title.count + count > 10) {
      title.level = Level.초보

    } else if (title.count + count > 30) {
      title.level = Level.중수

    } else if (title.count + count > 50) {
      title.level = Level.고수

    } else if (title.count + count > 80) {
      title.level = Level.전문가

    } else if (title.count + count > 120) {
      title.level = Level.신

    } else if (title.count + count > 200) {
      title.level = Level.음식
    }

    return title;
  }
}
