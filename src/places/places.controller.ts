import { Body, Controller, Get, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { PlacesService } from './places.service';

@ApiTags('Places')
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  /**
   * 지역별 장소 조회
   * @returns
   */
   @ApiBody({
    schema: {
      example: { dong: '두정동' },
    },
  })
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

  /**
   * 음식카테고리 조회
   * @returns
   */
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

  /**
   * 장소 조회
   * @param placeId
   * @returns
   */
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

  /**
   * 장소 검색
   * @returns
   */
   @ApiBody({
    schema: {
      example: { body: '피제이피자' },
    },
  })
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
