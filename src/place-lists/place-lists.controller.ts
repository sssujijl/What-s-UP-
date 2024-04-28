import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Put, HttpStatus } from '@nestjs/common';
import { PlaceListsService } from './place-lists.service';
import { CreatePlaceListDto } from './dto/create-place-list.dto';
import { UpdatePlaceListDto } from './dto/update-place-list.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/users/entities/user.entity';
import { validate } from 'class-validator';

@UseGuards(AuthGuard('jwt'))
@Controller('placeLists')
export class PlaceListsController {
  constructor(private readonly placeListsService: PlaceListsService) {}

  @Post()
  async createPlaceList(
    @UserInfo() user: User,
    @Body() createPlaceListDto: CreatePlaceListDto
  ) {
    try {
      await validate(createPlaceListDto);

      createPlaceListDto.userId = user.id
      const data = await this.placeListsService.createPlaceList(createPlaceListDto);
      return {
        statusCode: HttpStatus.OK,
        message: '장소를 성공적으로 생성하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @Get()
  async findPlaceLists(
    @Query('nickName') nickName: string,
    @UserInfo() user: User
  ) {
    try {
      const data = await this.placeListsService.findPlaceListsByUserId(user.id, nickName);
      return {
        statusCode: HttpStatus.OK,
        message: '장소를 성공적으로 조회하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @Get('/myPlaceLists')
  async findAllPlaceList(
    @UserInfo() user: User
  ) {
    try {
      const data = await this.placeListsService.findAllPlaceList(user.id);
      return {
        statusCode: HttpStatus.OK,
        message: '장소를 성공적으로 조회하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @Get('/:placeListId')
  async findPlaceList(
    @Param('placeListId') placeListId: number,
    @UserInfo() user: User
  ) {
    try {
      const data = await this.placeListsService.findPlaceListById(placeListId, user.id);
      return {
        statusCode: HttpStatus.OK,
        message: '장소를 성공적으로 조회하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @Patch('/:placeListId')
  async editPlaceList(
    @Param('placeListId') placeListId: number,
    @Body() updatePlaceListDto: UpdatePlaceListDto,
    @UserInfo() user: User
  ) {
    try {
      const data = await this.placeListsService.editPlaceList(placeListId, updatePlaceListDto, user.id);
      return {
        statusCode: HttpStatus.OK,
        message: '장소를 성공적으로 수정하였습니다',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @Delete('/:placeListId')
  async deletePlaceList(
    @Param('placeListId') placeListId: number,
    @UserInfo() user: User
  ) {
    try {
      const data = await this.placeListsService.deletePlaceList(placeListId, user.id);
      return {
        statusCode: HttpStatus.OK,
        message: '장소를 성공적으로 삭제하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @Get('/:placeListId/save')
  async savedPlace(
    @Param('placeListId') placeListId: number,
    @Query('placeId') placeId: number,
    @UserInfo() user: User
  ) {
    try {
      const data = await this.placeListsService.savedPlace(placeListId, placeId, user.id);
      return {
        statusCode: HttpStatus.OK,
        message: `장소를 성공적으로 ${data}하였습니다.`
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @Delete('/:placeListId')
  async canceledPlace(
    @Param('placeListId') placeListId: number,
    @Query('placeId') placeId: number,
    @UserInfo() user: User
  ) {
    try {
      const data = await this.placeListsService.canceledPlace(placeListId, placeId, user.id);
      return {
        statusCode: HttpStatus.OK,
        message: '장소를 성공적으로 삭제하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @Put('/:placeListId')
  async changeSavedPlace(
    @Param('placeListId') placeListId: number,
    @Query('placeId') placeId: number,
    @Body('newPlaceListId') newPlaceListId: number,
    @UserInfo() user: User
  ) {
    try {
      const data = await this.placeListsService.changeSavedPlace(placeListId, placeId, newPlaceListId, user.id);
      return {
        statusCode: HttpStatus.OK,
        message: '장소리스트를 성공적으로 옮겼습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
