import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Logger } from '@nestjs/common';
import { MissionsService } from './missions.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/users/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Missions')
@Controller('missions')
export class MissionsController {
  private readonly logger = new Logger(MissionsController.name);

  constructor(private readonly missionsService: MissionsService) {}

  @Get()
  async test() {
    try {
      const startTime = Date.now();
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
      // return await this.missionsService.test();
      // const placesByDong = await this.missionsService.placesByDong();
      // const selectedPlaceIds = await this.missionsService.selectedPlaceIds(placesByDong);
      // const resStatusIds = await this.missionsService.checkAndRepeat(placesByDong, selectedPlaceIds, mission, 0);
      // return resStatusIds;
      // const resStatusId = await this.missionsService.findResStatus(Object.values(selectedPlaceIds), mission);
      // const check = await this.missionsService.checkResStatus(selectedPlaceIds, resStatusId, mission.capacity);
      // return check;
      const mission = await this.missionsService.createRandomMissions(); 
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.logger.log(`createRandomMissions execution time: ${executionTime}ms`);
      return mission
      // const number = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      // return this.missionsService.random(number);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  /**
   * 미션 조회
   * @param missionId
   * @returns
   */
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
