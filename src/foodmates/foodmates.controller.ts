import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FoodmatesService } from './foodmates.service';
import { CreateFoodmateDto } from './dto/create-foodmate.dto';
import { UpdateFoodmateDto } from './dto/update-foodmate.dto';

@Controller('foodmates')
export class FoodmatesController {
  constructor(private readonly foodmatesService: FoodmatesService) {}

  @Post()
  create(@Body() createFoodmateDto: CreateFoodmateDto) {
    return this.foodmatesService.create(createFoodmateDto);
  }

  @Get()
  findAll() {
    return this.foodmatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.foodmatesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFoodmateDto: UpdateFoodmateDto) {
    return this.foodmatesService.update(+id, updateFoodmateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.foodmatesService.remove(+id);
  }
}
