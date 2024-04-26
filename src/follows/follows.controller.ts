import { Controller, Get, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { UsersService } from 'src/users/users.service';
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Follows')
@Controller('follows')
export class FollowsController {
  constructor(
    private readonly followsService: FollowsService,
    private readonly userService: UsersService
  ) {}

  /**
   * 팔로우하기
   * @param userId
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('/:userId')
  async follow(
    @Param('userId') userId: number,
    @UserInfo() user: User
  ) {
    try {
      await this.userService.findUserById(userId);

      const data = await this.followsService.follow(user.id, userId);
      return {
        statusCode: HttpStatus.OK,
        message: '성공적으로 팔로우 하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  /**
   * 팔로워 확인
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findFollower(
    @UserInfo() user: User
  ) {
    try {
      const data = await this.followsService.findFollower(user.id);
      return {
        statusCode: HttpStatus.OK,
        message: '팔로워 목록을 성공적으로 조회하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  /**
   * 팔로잉 확인
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('/:userId')
  async findFollowing(
    @Param('userId') userId: number
  ) {
    try {
      await this.userService.findUserById(userId);

      const data = await this.followsService.findFollowing(userId);
      return {
        statusCode: HttpStatus.OK,
        message: '팔로잉 목록을 성공적으로 조회하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
