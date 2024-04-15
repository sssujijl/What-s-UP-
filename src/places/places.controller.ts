import { Controller, Get, Param, Query } from '@nestjs/common';
import { PlacesService } from './places.service';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get()
  async findAllPlace() {
    try {
      return await this.placesService.findAllPlace();
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @Get('/:placeId')
  async findPlace(@Param('placeId') placeId: number) {
    try {
      return await this.placesService.findPlaceById(placeId);
    } catch (err) {
      return { message: `${err}`}
    }
  }
}
