import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Point } from 'src/points/entities/point.entity';
import { DataSource, Repository } from 'typeorm';
import { Title } from './entities/titles.entity';
import { Level } from './types/level.type';

@Injectable()
export class TitlesService {
  constructor(
    @InjectRepository(Title) private readonly titleRepository: Repository<Title>,
    private dataSource: DataSource,
  ) { }

  async givenTitle(userId: number, foodCategoryId: number, count: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const title = await this.findTitle(userId, foodCategoryId);

      if (!title) {
        const title = await queryRunner.manager.save(Title, { userId, foodCategoryId });
        
        await queryRunner.manager.save(Point, { userId, point: 1000 });
        await queryRunner.commitTransaction();

        return title;
      }

      title.count += count;
      const newTitle = await this.upgradeTitle(title);

      const upgradeTitle = await queryRunner.manager.update(Title, title.id, newTitle);

      if (title.level !== newTitle.level) {
        const point = await this.paymentPoint(newTitle.level);

        await queryRunner.manager.save(Point, {userId, point});
      }

      await queryRunner.commitTransaction();

      return upgradeTitle;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return { message: `${err}` }
    } finally {
      await queryRunner.release();
    }
  }

  async findTitle(userId: number, foodCategoryId: number) {
    const title = await this.titleRepository.findOneBy({ userId, foodCategoryId });

    return title;
  }

  async findAllTitles(userId: number) {
    const titles = await this.titleRepository.findBy({ userId });

    return titles;
  }

  async Top3_Titles(userId: number) {
    const titles = await this.findAllTitles(userId);

    const top3 = titles.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count; 
      } else {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    }).slice(0, 3);

    if (!titles) {
      throw new NotFoundException('칭호가 없습니다.')
    }
    return top3;
  }

  async upgradeTitle(title: Title) {

    if (title.count > 10) {
      title.level = Level.초보

    } else if (title.count > 30) {
      title.level = Level.중수

    } else if (title.count > 50) {
      title.level = Level.고수

    } else if (title.count > 80) {
      title.level = Level.전문가

    } else if (title.count > 120) {
      title.level = Level.신

    } else if (title.count > 200) {
      title.level = Level.음식
    }

    return title;
  }

  async paymentPoint(level: Level) {
    let point:number = 0;

    if (level === Level.초보) {
      point = 3000;

    } else if (level === Level.중수) {
      point = 5000;

    } else if (level === Level.고수) {
      point = 8000;

    } else if (level === Level.전문가) {
      point = 12000;

    } else if (level === Level.신) {
      point = 15000;

    } else if (level === Level.음식) {
      point = 20000;
    }

    return point;
  }

}
