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
      const data = await this.missionsService.findTodayMission();

      return {
        statusCode: HttpStatus.OK,
        message: '미션을 성공적으로 조회하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @Get('/info')
  async findTodayMissionInfo() {
    try {
      const data = await this.missionsService.findTodayMissionInfo();

      return {
        statusCode: HttpStatus.OK,
        message: '미션 장소들을 성공적으로 조회하였습니다.',
        data
      };
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

  @Get('test/test')
  async test() {
    return await this.missionsService.test()
  }
}
