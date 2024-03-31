import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FoodieAnswersService } from './foodie_answers.service';
import { CreateFoodieAnswerDto } from './dto/create-foodie_answer.dto';
import { UpdateFoodieAnswerDto } from './dto/update-foodie_answer.dto';
import { PATH_METADATA } from '@nestjs/common/constants';

@Controller('foodie-answers')
export class FoodieAnswersController {
  constructor(private readonly foodieAnswersService: FoodieAnswersService) {}

  @Post('create')
  async createAnswer(
    @Param("userId") userId: number,
    @Param('foodieId') foodieId: number,
    @Body() createFoodieAnswerDto: CreateFoodieAnswerDto
  ){
    try {
      // 1. 게시물에 답글을 작성하려면 일단 로그인된 유저야하고
      // 2.  
    } catch (err) {
      return { message: `${err}`};
    }
  }

  @Get() 
  async findAllAnswers(
    @Param("foodieId") foodieId: number,
    @Param("userId") userId: number
  )
  {
    try {
      await this.
    } catch (err) {
      return { message: `${err}`};
    }
  }


}
