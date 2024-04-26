import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PlacesService } from './places.service';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  async findAllPlace(
    @Body() { dong }: { dong: string },
    @Query('category') category: string
  ) {
    try {
      console.log(category)
      return await this.placesService.findAllPlace(dong, category);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @Get('/foodCategory')
  async findAllFoodCategory() {
    try {
      return await this.placesService.findAllFoodCategory();
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @Get('/:placeId')
  async findPlace(@Param('placeId') placeId: number) {
    try {
      return await this.placesService.findPlaceById(placeId);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @Post('/search')
  async searchPlaces(@Body('data') data: string) {
    try {
      console.log(data);
      return await this.placesService.searchPlaces(data);
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
