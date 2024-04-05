import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MissionsService } from './missions.service';

@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Get(':id')
  async test(@Param('id') id: number) {
    try {
      // const placeIds = await this.missionsService.findByAddress();
      // console.log(placeIds);
      // return placeIds;
      const placeIds: {} = {
        '역삼동': [ "2" ],
        '청담동': [ "3" ],
        '신사동': [ "4" ]
      };
      // return await this.missionsService.reSearch(placeIds);
      const mission = await this.missionsService.findMission(id);
      const resStatus = await this.missionsService.findResStatus(Object.values(placeIds), mission);
      const resStatusId = await this.missionsService.checkAndRepeat(placeIds, resStatus, mission);
      const test = resStatusId.flat();
      return test
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
