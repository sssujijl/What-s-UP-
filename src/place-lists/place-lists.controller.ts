import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlaceListsService } from './place-lists.service';
import { CreatePlaceListDto } from './dto/create-place-list.dto';
import { UpdatePlaceListDto } from './dto/update-place-list.dto';

@Controller('place-lists')
export class PlaceListsController {
  constructor(private readonly placeListsService: PlaceListsService) {}

  @Post()
  create(@Body() createPlaceListDto: CreatePlaceListDto) {
    return this.placeListsService.create(createPlaceListDto);
  }

  @Get()
  findAll() {
    return this.placeListsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.placeListsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlaceListDto: UpdatePlaceListDto) {
    return this.placeListsService.update(+id, updatePlaceListDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.placeListsService.remove(+id);
  }
}
