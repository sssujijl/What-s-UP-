import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { create } from 'lodash';
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

  async createFoodie(createFoodieDto: CreateFoodieDto) {
    return await this.foodieRepository.save(createFoodieDto)
  }

  async findFoodie(id: number) {
    const foodie = await this.foodieRepository.findOneBy({ id });

    if (!foodie) {
      throw new NotFoundException('해당 맛집인을 찾을 수 없습니다.');
    }

    return foodie;
  }

  async findAllFoodies(id:number) {
    const foodie = await this.foodieRepository.findBy({ id })
    return foodie;
  }
    

  async updateFoodie(foodieId: number, userId: number, updateFoodieDto: UpdateFoodieDto) {
    const foodie = await this.findOneById(foodieId);

    if (foodie.userId !== userId) {
      throw new UnauthorizedException('해당 맛집인을 수정할 권한이 없습니다.')
    } 
    return await this.foodieRepository.update(foodieId, updateFoodieDto)
  }

  async deleteFoodie(foodieId: number, userId: number) {
    const foodie = await this.findOneById(foodieId);

    if (foodie.userId !== userId ) {
      throw new UnauthorizedException('해당 맛집인을 삭제할 권한이 없습니다.');
    }

    foodie.deletedAt = new Date();
    return await this.foodieRepository.save(foodie);
  }
}
