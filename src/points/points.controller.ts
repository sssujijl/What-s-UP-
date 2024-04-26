import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { PointsService } from './points.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { ApiTags }  from '@nestjs/swagger'

@ApiTags('Points')
@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  /**
   * 포인트 조회
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findPoint(@UserInfo() user: User) {
    try {
      const data = this.pointsService.findPoint(user.id);
      return {
        statusCode: HttpStatus.OK,
        message: '포인트를 성공적으로 조회하였습니다.',
        data
      };
    } catch (err) {
      return {message: `${err}` }
    }
  }
}
