import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MissionsService } from './missions.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  // @Get(':id')
  // async test(@Param('id') id: number) {
  //   try {
      // const placeIds = await this.missionsService.findByAddress();
      // console.log(placeIds);
      // return placeIds;
      // const placeIds: {} = {
      //   '역삼동': [ "2" ],
      //   '청담동': [ "3" ],
      //   '신사동': [ "4" ]
      // };
      // return await this.missionsService.reSearch(placeIds);
      // const mission = await this.missionsService.findMission(id);
      // const resStatus = await this.missionsService.findResStatus(Object.values(placeIds), mission);
      // const resStatusId = await this.missionsService.checkAndRepeat(placeIds, resStatus, mission);
      // const test = resStatusId.flat();
      // return test
  //   } catch (err) {
  //     return { message: `${err}` }
  //   }
  // }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:missionId')
  async findMission(
    @UserInfo() user: User,
    @Param('missionId') missionId: number
  ) {
    try {
      return await this.missionsService.findMission(missionId);
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
