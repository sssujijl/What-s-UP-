import _ from 'lodash';
import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateFoodmateDto } from './dto/create-foodmate.dto';
import { UpdateFoodmateDto } from './dto/update-foodmate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FoodMate } from './entities/foodmate.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class FoodmatesService {
  constructor(
    @InjectRepository(FoodMate)
    private foodmateRepository: Repository<FoodMate>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createFoodmateDto: CreateFoodmateDto, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (_.isNil(user)) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const foodmate = await this.foodmateRepository.save(createFoodmateDto);

    return foodmate;
  }

  async findAll() {
    return await this.foodmateRepository.find({
      relations: ['userFoodMates', 'foodCategory']
    });
  }

  async findOne(id: number) {
    return await this.foodmateRepository.findOne({ where: { id } });
  }

  async update(id: number, updateFoodmateDto: UpdateFoodmateDto) {
    const { content, gender, age, region, dateTime, capacity, status } =
      updateFoodmateDto;
    const foodmate = await this.foodmateRepository.findOne({ where: { id } });
    if (!foodmate) {
      throw new NotFoundException('밥친구를 찾을 수 없습니다.');
    }

    return await this.foodmateRepository.update(id, {
      content,
      gender,
      age,
      region,
      dateTime,
      capacity,
      status,
    });
  }

  async remove(id: number) {
    const foodmate = await this.foodmateRepository.findOne({ where: { id } });
    if (!foodmate) {
      throw new NotFoundException('밥친구를 찾을 수 없습니다.');
    }

    return this.foodmateRepository.delete({ id });
  }
}
