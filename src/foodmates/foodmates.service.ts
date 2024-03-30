import { Injectable } from '@nestjs/common';
import { CreateFoodmateDto } from './dto/create-foodmate.dto';
import { UpdateFoodmateDto } from './dto/update-foodmate.dto';

@Injectable()
export class FoodmatesService {
  create(createFoodmateDto: CreateFoodmateDto) {
    return 'This action adds a new foodmate';
  }

  findAll() {
    return `This action returns all foodmates`;
  }

  findOne(id: number) {
    return `This action returns a #${id} foodmate`;
  }

  update(id: number, updateFoodmateDto: UpdateFoodmateDto) {
    return `This action updates a #${id} foodmate`;
  }

  remove(id: number) {
    return `This action removes a #${id} foodmate`;
  }
}
