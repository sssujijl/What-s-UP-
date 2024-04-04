import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { UsersService } from 'src/users/users.service';

@Controller('follows')
export class FollowsController {
  constructor(
    private readonly followsService: FollowsService,
    private readonly userService: UsersService
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('/:userId')
  async follow(
    @Param('userId') userId: number,
    @UserInfo() user: User
  ) {
    try {
      await this.userService.findUserById(userId);

      return await this.followsService.follow(user.id, userId);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findFollower(
    @UserInfo() user: User
  ) {
    try {
      return await this.followsService.findFollower(user.id);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:userId')
  async findFollowing(
    @Param('userId') userId: number
  ) {
    try {
      await this.userService.findUserById(userId);

      return await this.followsService.findFollowing(userId);
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
