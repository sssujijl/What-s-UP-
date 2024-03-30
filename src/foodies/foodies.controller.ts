import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FoodiesService } from './foodies.service';
import { CreateFoodieDto } from './dto/create-foodie.dto';
import { UpdateFoodieDto } from './dto/update-foodie.dto';

@Controller('foodies')
export class FoodiesController {
  constructor(private readonly foodiesService: FoodiesService) {}

  @Post()
  create(@Body() createFoodieDto: CreateFoodieDto) {
    return this.foodiesService.create(createFoodieDto);
  }

  @Get()
  findAll() {
    return this.foodiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.foodiesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFoodieDto: UpdateFoodieDto) {
    return this.foodiesService.update(+id, updateFoodieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.foodiesService.remove(+id);
  }
}
