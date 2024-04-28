import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Menus')
@Controller('places/:placeId/menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  /**
   * 전체 메뉴 조회
   * @param placeId
   * @returns
   */
  @Get()
  async findAllMenuByPlaceId(@Param('placeId') placeId: number) {
    try {
      const data = await this.menusService.findAllMenuByPlaceId(placeId);
      return {
        statusCode: HttpStatus.OK,
        message: '메뉴를 성공적으로 조회했습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
