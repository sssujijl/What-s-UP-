import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MissionsService } from './missions.service';

@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Get()
  async test() {
    try {
      return this.missionsService.randomPlace();
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
