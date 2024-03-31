import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFoodieAnswerDto } from './dto/create-foodie_answer.dto';
import { UpdateFoodieAnswerDto } from './dto/update-foodie_answer.dto';
import { Foodie_Answer } from './entities/foodie_answer.entity';

@Injectable()
export class FoodieAnswersService {
  constructor(
    @InjectRepository(Foodie_Answer) private readonly foodieAnswerRepository: Repository<Foodie_Answer>
  ) {}

  async createAnswer(createFoodieAnswerDto: CreateFoodieAnswerDto) {
    return await this.foodieAnswerRepository.save(createFoodieAnswerDto)
  }

  async findAllAnswers(foodieId: number) {
    const foodieAnswer = await this.foodieAnswerRepository.findBy({ foodieId });
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
