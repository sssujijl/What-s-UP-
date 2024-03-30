import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FoodieAnswersService } from './foodie_answers.service';
import { CreateFoodieAnswerDto } from './dto/create-foodie_answer.dto';
import { UpdateFoodieAnswerDto } from './dto/update-foodie_answer.dto';

@Controller('foodie-answers')
export class FoodieAnswersController {
  constructor(private readonly foodieAnswersService: FoodieAnswersService) {}

  @Post()
  create(@Body() createFoodieAnswerDto: CreateFoodieAnswerDto) {
    return this.foodieAnswersService.create(createFoodieAnswerDto);
  }

  @Get()
  findAll() {
    return this.foodieAnswersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.foodieAnswersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFoodieAnswerDto: UpdateFoodieAnswerDto) {
    return this.foodieAnswersService.update(+id, updateFoodieAnswerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.foodieAnswersService.remove(+id);
  }
}
