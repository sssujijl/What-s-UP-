import { Body, Controller, Get, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { PlacesService } from './places.service';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  async findAllPlace(
    @Body() address: { address: string, dong: string },
    @Query('category') category: string
  ) {
    try {
      const data = await this.placesService.findAllPlace(address, category);
      return {
        statusCode: HttpStatus.OK,
        message: '장소를 성공적으로 조회하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @Get('/foodCategory')
  async findAllFoodCategory() {
    try {
      const data = await this.placesService.findAllFoodCategory();
      return {
        statusCode: HttpStatus.OK,
        message: '음식카테고리를 성공적으로 조회하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @Get('/:placeId')
  async findPlace(@Param('placeId') placeId: number) {
    try {
      const data = await this.placesService.findPlaceById(placeId);
      return {
        statusCode: HttpStatus.OK,
        message: '장소를 성공적으로 찾았습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @Post('/search')
  async searchPlaces(@Body('body') body: string) {
    try {
      const data = await this.placesService.searchPlaces(body);
      return {
        statusCode: HttpStatus.OK,
        message: '장소를 성공적으로 검색하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
