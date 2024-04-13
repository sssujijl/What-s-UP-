import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { TitlesService } from './titles.service';

@Controller('titles')
export class TitlesController {
  constructor(
    private readonly titlesService: TitlesService
  ) {}

}
