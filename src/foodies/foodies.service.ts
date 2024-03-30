import { Injectable } from '@nestjs/common';
import { CreateFoodieDto } from './dto/create-foodie.dto';
import { UpdateFoodieDto } from './dto/update-foodie.dto';

@Injectable()
export class FoodiesService {
  create(createFoodieDto: CreateFoodieDto) {
    return 'This action adds a new foodie';
  }

  findAll() {
    return `This action returns all foodies`;
  }

  findOne(id: number) {
    return `This action returns a #${id} foodie`;
  }

  update(id: number, updateFoodieDto: UpdateFoodieDto) {
    return `This action updates a #${id} foodie`;
  }

  remove(id: number) {
    return `This action removes a #${id} foodie`;
  }
}
