import { Controller, Get, Query } from '@nestjs/common';
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
}
