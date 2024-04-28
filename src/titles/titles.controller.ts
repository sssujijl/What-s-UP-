import { Body, Controller, Post, UseGuards, Get, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { TitlesService } from './titles.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Titles')
@Controller('titles')
export class TitlesController {
  constructor(
    private readonly titlesService: TitlesService
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAllTitles(@UserInfo() user: User) {
    try {
      const data = await this.titlesService.findAllTitles(user.id); 
      return {
        statusCode: HttpStatus.OK,
        message: '전체 칭호를 성공적으로 조회하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` };
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/top3')
  async Top3_Titles(@UserInfo() user:User) {
    try {
      const data = await this.titlesService.Top3_Titles(user.id);
      return {
        statusCode: HttpStatus.OK,
        message: '칭호 Top3를 성공적으로 조회하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}`};
    }
  }

  @Get('ranking')
  async rankingTitle() {
    try {
      const data = await this.titlesService.rankingTitle();
      return {
        statusCode: HttpStatus.OK,
        message: '카테고리별 랭킹을 성공적으로 조회하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
