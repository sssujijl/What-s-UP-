import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Menus')
@Controller('places/:placeId/menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  async findAllMenuByPlaceId(@Param('placeId') placeId: number) {
    try {
      return await this.menusService.findAllMenuByPlaceId(placeId);
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
