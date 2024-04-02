import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FoodieAnswersService } from './foodie_answers.service';
import { CreateFoodieAnswerDto } from './dto/create-foodie_answer.dto';
import { UpdateFoodieAnswerDto } from './dto/update-foodie_answer.dto';
import { FoodiesService } from 'src/foodies/foodies.service';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/users/entities/user.entity';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import { validate } from 'class-validator';

@Controller('/foodie/:foodieId/foodie_answer')
export class FoodieAnswersController {
  constructor(
    private readonly foodieAnswersService: FoodieAnswersService,
    private readonly foodiesService: FoodiesService
  ) { }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createAnswer(
    @Param('foodieId') foodieId: number,
    @UserInfo() user: User,
    @Body() createFoodieAnswerDto: CreateFoodieAnswerDto
  ) {
    try {
      // 1. 게시물이 실제로 있는 게시물인지 확인
      await validate(createFoodieAnswerDto);

      const foodie = await this.foodiesService.findOneById(foodieId);
      createFoodieAnswerDto.foodieId = foodieId;

      createFoodieAnswerDto.userId = user.id;
      return await this.foodieAnswersService.createAnswer(createFoodieAnswerDto);
    } catch (err) {
      return { message: `${err}` };
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
      return { message: `${err}` };
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/:foodieAnswerId')
  async updateAnswer(
    @Param("foodieId") foodieId: number,
    @Param("foodieAnswerId") foodieAnswerId: number,
    @UserInfo() user: User,
    @Body() updateFoodieAnswerDto: UpdateFoodieAnswerDto
  ) {
    try {
      await validate(updateFoodieAnswerDto);

      await this.foodiesService.findOneById(foodieId);

      return await this.foodieAnswersService.updateAnswer(foodieAnswerId, user.id, updateFoodieAnswerDto)
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/:foodieAnswerId')
  async deleteAnswer(
    @Param("foodieId") foodieId: number,
    @Param("foodieAnswerId") foodieAnswerId: number,
  ) {
    try {
      await this.foodiesService.findOneById(foodieId);

      return await this.foodiesService.findOneById(foodieAnswerId)
    } catch (err) {
      return { message: `${err}` }
    }
  }


}
