import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Logger, HttpStatus } from '@nestjs/common';
import { MissionsService } from './missions.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { CreateMissionDto } from './dto/create-mission.dto';
import { Time } from './types/mission_time.type';

@ApiTags('Missions')
@Controller('missions')
export class MissionsController {
  private readonly logger = new Logger(MissionsController.name);

  constructor(private readonly missionsService: MissionsService) {}

  @Get()
  async findTodayMission() {
    try {
      return await this.missionsService.findTodayMission();
      // const createMissionDto: CreateMissionDto = {
      //   capacity: 0,
      //   date: '',
      //   time: Time.TEN_AM
      // };
      // return await this.missionsService.test();
      // return await this.missionsService.createRandomMissions(createMissionDto);
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
    @Param('missionId') missionId: number
  ) {
    try {
      const data = await this.missionsService.findMission(missionId);
      return {
        statusCode: HttpStatus.OK,
        message: '미션을 성공적으로 조회하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
