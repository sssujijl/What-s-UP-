import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Put, HttpStatus } from '@nestjs/common';
import { PlaceListsService } from './place-lists.service';
import { CreatePlaceListDto } from './dto/create-place-list.dto';
import { UpdatePlaceListDto } from './dto/update-place-list.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/users/entities/user.entity';
import { validate } from 'class-validator';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@UseGuards(AuthGuard('jwt'))
@ApiTags('PlaceLists')
@Controller('placeLists')
export class PlaceListsController {
  constructor(private readonly placeListsService: PlaceListsService) {}
  
  /**
   * 장소리스트 생성
   * @returns
   */
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

  /**
   * 장소리스트 조회
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
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

  /**
   * 나의 장소리스트 조회
   * @returns 
   */
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

  /**
   * 장소리스트 상세조회
   * @param placeListId
   * @returns
   */
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

  /**
   * 장소리스트 수정
   * @param placeListId
   * @returns
   */
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

  /**
   * 장소리스트 삭제
   * @param placeListId
   * @returns
   */
  @UseGuards(AuthGuard('author'))
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

  /**
   * 장소리스트 저장
   * @param placeListId
   * @returns
   */
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

  /**
   * 저장된 장소리스트 삭제
   * @param placeListId
   * @returns
   */
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

  /**
   * 저장된 장소리스트 변경
   * @param placeListId
   * @returns
   */
   @ApiBody({
    schema: {
      example: { newPlaceListId: 1 },
    },
  })
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
