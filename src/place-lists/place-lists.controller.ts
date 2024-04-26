import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Put } from '@nestjs/common';
import { PlaceListsService } from './place-lists.service';
import { CreatePlaceListDto } from './dto/create-place-list.dto';
import { UpdatePlaceListDto } from './dto/update-place-list.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/users/entities/user.entity';
import { validate } from 'class-validator';

@Controller('placeLists')
export class PlaceListsController {
  constructor(private readonly placeListsService: PlaceListsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createPlaceList(
    @UserInfo() user: User,
    @Body() createPlaceListDto: CreatePlaceListDto
  ) {
    try {
      await validate(createPlaceListDto);

      createPlaceListDto.userId = user.id
      return await this.placeListsService.createPlaceList(createPlaceListDto);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findPlaceLists(
    @Query('nickName') nickName: string,
    @UserInfo() user: User
  ) {
    try {
      return await this.placeListsService.findPlaceListsByUserId(user.id, nickName);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:placeListId')
  async findPlaceList(
    @Param('placeListId') placeListId: number,
    @UserInfo() user: User
  ) {
    try {
      return await this.placeListsService.findPlaceListById(placeListId, user.id);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @UseGuards(AuthGuard('author'))
  @Patch('/:placeListId')
  async editPlaceList(
    @Param('placeListId') placeListId: number,
    @Body() updatePlaceListDto: UpdatePlaceListDto
  ) {
    try {
      return await this.placeListsService.editPlaceList(placeListId, updatePlaceListDto);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @UseGuards(AuthGuard('author'))
  @Patch('/:placeListId')
  async deletePlaceList(@Param('placeListId') placeListId: number) {
    try {
      return await this.placeListsService.deletePlaceList(placeListId);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @UseGuards(AuthGuard('author'))
  @Post('/:placeListId')
  async savedPlace(
    @Param('placeListId') placeListId: number,
    @Query('placeId') placeId: number
  ) {
    try {
      return await this.placeListsService.savedPlace(placeListId, placeId);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @UseGuards(AuthGuard('author'))
  @Delete('/:placeListId')
  async canceledPlace(
    @Param('placeListId') placeListId: number,
    @Query('placeId') placeId: number
  ) {
    try {
      return await this.placeListsService.canceledPlace(placeListId, placeId);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @UseGuards(AuthGuard('author'))
  @Put('/:placeListId')
  async movedPlace(
    @Param('placeListId') placeListId: number,
    @Query('placeId') placeId: number,
    @Body('newPlaceListId') newPlaceListId: number
  ) {
    try {
      return await this.placeListsService.movedPlace(placeListId, placeId, newPlaceListId);
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
