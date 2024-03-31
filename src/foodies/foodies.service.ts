import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFoodieDto } from './dto/create-foodie.dto';
import { UpdateFoodieDto } from './dto/update-foodie.dto';
import { Foodie } from './entities/foodie.entity';

@Injectable()
export class FoodiesService {
 
  constructor(
    @InjectRepository(Foodie) private readonly foodieRepository: Repository<Foodie>
  ) {}

  async findOneById(id: number) {
    const foodie = await this.foodieRepository.findOneBy({ id });

    if (!foodie) {
      throw new NotFoundException('해당 맛집인을 찾을 수 없습니다.');
    }

    return foodie;
  }
}
