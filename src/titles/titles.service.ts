import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Title } from './entities/title.entity';
import { User_Title } from './entities/user_titles.entity';

@Injectable()
export class TitlesService {
  constructor (
    @InjectRepository(Title) private readonly titleRepository: Repository<Title>,
    @InjectRepository(User_Title) private readonly userTitleRepository: Repository<User_Title>
  ) {}

  // 유저에게 생성한 칭호 부여
  // 1. 푸드 카테고리에 있는 칭호를 가져와서
  // 2. 유저가 리뷰를 작성하면
  // 3. 해당 음식 카테고리의 칭호를 얻고 카운트 +1 해준다
  async createUserTitle(userId: number, titleId: number) {
    const userTitle = await this.createUserTitle()
  }


  async findUserTitle(userId: number, titleId: number) {
    // Foodie 조건 Title -> 이하는 답변달수없음
    const title = await this.findTitle(titleId);

    const userTitle = await this.userTitleRepository
    .createQueryBuilder("userTitle")
    .innerJoinAndSelect("userTitle.title", "title")
    .innerJoin("title.foodCategory", "foodCategory")
    .where("userTitle.userId = :userId", { userId })
    .andWhere("title.level >= :level", { level: title.level })
    .andWhere("foodCategory.id = :foodCategoryId", { foodCategoryId: title.foodCategoryId })
    .getOne();

    if (!userTitle) {
      throw new UnauthorizedException('해당 유저는 답변 권한이 없습니다.');
    }

    return userTitle;
  }

  async findTitle(titleId: number) {
    const title = await this.titleRepository.findOneBy({ id: titleId });

    if (!title) {
      throw new NotFoundException('해당 칭호를 찾을 수 없습니다.');
    }

    return title;
  }

  async findTitlesByFoodCategoryId(foodCategoryId: number) {
    const titles = await this.titleRepository.find({ where: {foodCategoryId} });

    if (!titles) {
      throw new NotFoundException('해당 카테고리별 칭호를 찾을 수 없습니다.');
    }
    return titles;
  }
}
