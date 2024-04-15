import { Body, Controller, Post, UseGuards, Get } from '@nestjs/common';
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
      return await this.titlesService.findAllTitles(user.id); 
    } catch (err) {
      return { message: `${err}` };
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/top3')
  async Top3_Titles(@UserInfo() user:User) {
    try {
      return await this.titlesService.Top3_Titles(user.id)
    } catch (err) {
      return { message: `${err}`};
    }
  }
}
