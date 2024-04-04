import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PointsService } from './points.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { UserInfo } from 'src/utils/userInfo.decorator';

@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findPoint(@UserInfo() user: User) {
    try {
      await this.pointsService.findPoint(user.id);
    } catch (err) {
      return {message: `${err}` }
    }
  }
}
