import { Controller, Post } from '@nestjs/common';
import { TitlesService } from './titles.service';

@Controller('titles')
export class TitlesController {
  constructor(
    private readonly titlesService: TitlesService
  ) {}


  @Post()
  async createTitle(
    
  ) {}
}
