import { Injectable } from '@nestjs/common';
import { CreateFoodieAnswerDto } from './dto/create-foodie_answer.dto';
import { UpdateFoodieAnswerDto } from './dto/update-foodie_answer.dto';

@Injectable()
export class FoodieAnswersService {
  create(createFoodieAnswerDto: CreateFoodieAnswerDto) {
    return 'This action adds a new foodieAnswer';
  }

  findAll() {
    return `This action returns all foodieAnswers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} foodieAnswer`;
  }

  update(id: number, updateFoodieAnswerDto: UpdateFoodieAnswerDto) {
    return `This action updates a #${id} foodieAnswer`;
  }

  remove(id: number) {
    return `This action removes a #${id} foodieAnswer`;
  }
}
