import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FoodieAnswersService } from './foodie_answers.service';
import { CreateFoodieAnswerDto } from './dto/create-foodie_answer.dto';
import { UpdateFoodieAnswerDto } from './dto/update-foodie_answer.dto';
import { PATH_METADATA } from '@nestjs/common/constants';
import { FoodiesService } from 'src/foodies/foodies.service';
import { userInfo } from 'os';
import { User } from 'src/users/entities/user.entity';

@Controller('/foodie/:foodieId/foodie_answer')
export class FoodieAnswersController {
  constructor(
    private readonly foodieAnswersService: FoodieAnswersService,
    private readonly foodiesService: FoodiesService) {}

  @Post()
  async createAnswer(
    @Param('foodieId') foodieId: number,
    // @userInfo() user: User,
    @Body() createFoodieAnswerDto: CreateFoodieAnswerDto
  ) {
    try {
      // 1. 게시물이 실제로 있는 게시물인지 확인
      await this.foodiesService.findOneById(foodieId);
      createFoodieAnswerDto.foodieId = foodieId;

      // createFoodieAnswerDto.userId = user.id;
      return await this.foodieAnswersService.createAnswer(createFoodieAnswerDto);
    } catch (err) {
      return { message: `${err}`};
    }
  }

  @Get() 
  async findAllAnswers(
    @Param("foodieId") foodieId: number
  ) {
    try {
      await this.foodiesService.findOneById(foodieId);

      return await this.foodieAnswersService.findAllAnswers(foodieId)
    } catch (err) {
      return { message: `${err}`};
    }
  }

  @Patch('/:foodieAnswerId')
  async updateAnswer(
    @Param("foodieId") foodieId: number,
    @Param("foodieAnswerId") foodieAnswerId: number,
    // @userInfo() user: User,
    @Body() updateFoodieAnswerDto: UpdateFoodieAnswerDto
  ) {
    try {
      await this.foodiesService.findOneById(foodieId);

      return await this.foodieAnswersService.updateAnswer(foodieAnswerId, userId ,updateFoodieAnswerDto)
    } catch (err) {
      return { message: `${err}`}
    }
  }

  @Delete('/:foodieAnswerId')
  async deleteAnswer(
    @Param("foodieId") foodieId: number,
    @Param("foodieAnswerId") foodieAnswerId: number
    // @userInfo() user: User
  ) {
    try {
      await this.foodiesService.findOneById(foodieId);

      return await this.foodiesService.findOneById(foodieAnswerId, user.id)
    } catch (err) {
      return { message: `${err}`}
    }
  }


}
