import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Foodie } from 'src/foodies/entities/foodie.entity';
import { FoodiesService } from 'src/foodies/foodies.service';
import { TitlesService } from 'src/titles/titles.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateFoodieAnswerDto } from './dto/create-foodie_answer.dto';
import { UpdateFoodieAnswerDto } from './dto/update-foodie_answer.dto';
import { Foodie_Answer } from './entities/foodie_answer.entity';

@Injectable()
export class FoodieAnswersService {
  constructor(
    @InjectRepository(Foodie_Answer) private readonly foodieAnswerRepository: Repository<Foodie_Answer>,
    private readonly titleService: TitlesService,
  ) {}

  async checkTitle(foodie: Foodie, user: User) {
    const userTitle = await this.titleService.findTitle(user.id, foodie.foodCategoryId)
    if (!userTitle) {
      throw new NotFoundException('칭호를 찾을 수 없습니다.')
    }

    if (foodie.level > userTitle.level) {
      throw new UnauthorizedException('답글을 작성할 권한이 없습니다.')
    }

    return userTitle;
  }



  async createAnswer(foodie: Foodie, createFoodieAnswerDto: CreateFoodieAnswerDto) {
    const title = await this.titleService.findTitle(createFoodieAnswerDto.userId, foodie.foodCategoryId);

    if (foodie.level !== title.level || !title) {
      throw new UnauthorizedException('해당 게시물에 댓글을 달 수 있는 권한이 없습니다.');
    }
    
    return await this.foodieAnswerRepository.save(createFoodieAnswerDto)
  }

  async findAllAnswers(foodieId: number) {
    const foodieAnswer = await this.foodieAnswerRepository.find({
      where: { foodieId },
      relations: ['user']
    });
    
    if(!foodieAnswer) {
      throw new NotFoundException('답글이 없습니다.');
    }
    return foodieAnswer
  }

  async findAnswerById(id: number) {
    const answer = await this.foodieAnswerRepository.findOneBy({ id });

    if (!answer) {
      throw new NotFoundException('해당 답변을 찾을 수 없습니다.');
    }

    return answer;
  }

  async updateAnswer(foodieAnswerId: number,userId: number, updateFoodieAnswerDto: UpdateFoodieAnswerDto) {
    const answer = await this.findAnswerById(foodieAnswerId);

    if (answer.userId !== userId) {
      throw new UnauthorizedException('해당 답글을 수정할 권한이 없습니다.');
    }
    return await this.foodieAnswerRepository.update(foodieAnswerId, updateFoodieAnswerDto);
  }

  async deleteAnswer(foodieAnswerId: number, userId: number) {
    const answer = await this.findAnswerById(foodieAnswerId);

    if (answer.userId !== userId ) {
      throw new UnauthorizedException('해당 답글을 삭제할 권한이 없습니다.');
    }
    
    answer.deletedAt = new Date();
    return await this.foodieAnswerRepository.save(answer);
  }
}
