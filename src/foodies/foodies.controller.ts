import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, HttpStatus } from '@nestjs/common';
import { FoodiesService } from './foodies.service';
import { CreateFoodieDto } from './dto/create-foodie.dto';
import { UpdateFoodieDto } from './dto/update-foodie.dto';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/users/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { validate } from 'class-validator';
import { ApiTags } from '@nestjs/swagger';
import { orderBy } from 'lodash';

@ApiTags('Foodies')
@Controller('foodies')
export class FoodiesController {
  constructor(
    private readonly foodiesService: FoodiesService
  ) { }

  /**
   * 맛집인 등록
   * @returns
   */
  // 게시물 생성
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createFoodie(
    @UserInfo() user: User,
    @Body() createFoodieDto: CreateFoodieDto
  ) {
    try {
      await validate(createFoodieDto);

      createFoodieDto.userId = user.id;
      const data = await this.foodiesService.createFoodie(createFoodieDto);
      return {
        statusCode: HttpStatus.OK,
        message: '맛집인이 성공적으로 생성되었습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` };
    }
  }

  /**
   * 맛집인 목록 조회
   * @returns
   */
  // 게시물 전체조회
  @Get()
  async findAllFoodies(
    @Query('orderBy') orderBy: string,
    @Query('category') category: string,
  ) {
    try {
      const data = await this.foodiesService.findAllFoodies(orderBy, category);
      return {
        statusCode: HttpStatus.OK,
        message: '맛집인을 성공적으로 조회하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` };
    }
  }

  /**
   * 맛집인 상세 조회
   * @param foodieId
   * @returns
   */
  // 게시물 상세조회
  @Get('/:foodieId')
  async findFoodie(
    @Param("foodieId") foodieId: number,
    @Req() req: any
  ) {
    try {
      const userIP = req.ip;
      const data = await this.foodiesService.findFoodieById(foodieId, userIP);
      return {
        statusCode: HttpStatus.OK,
        message: '맛집인을 성공적으로 조회하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  /**
   * 맛집인 수정
   * @param foodieId
   * @returns
   */
  // 게시물 수정
  @UseGuards(AuthGuard('jwt'))
  @Patch('/:foodieId')
  async updateFoodie(
    @Param("foodieId") foodieId: number,
    @UserInfo() user: User,
    @Body() updateFoodieDto: UpdateFoodieDto
  ) {
    try {
      const data = await this.foodiesService.updateFoodie(foodieId, user.id, updateFoodieDto);
      return {
        statusCode: HttpStatus.OK,
        message: '맛집인이 성공적으로 수정되었습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  /**
   * 맛집인 삭제
   * @param foodieId
   * @returns
   */
  // 게시물 삭제
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:foodieId')
  async deleteFoodie(
    @Param("foodieId") foodieId: number,
    @UserInfo() user: User,
  ) {
    try {
      const data = await this.foodiesService.deleteFoodie(foodieId, user.id);
      return {
        statusCode: HttpStatus.OK,
        message: '맛집인이 성공적으로 삭제되었습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}`}
    }
  }

  @Post('/search')
  async searchFoodie(@Body('body') body: string) {
    try {
      const data = await this.foodiesService.searchFoodies(body);
      return {
        statusCode: HttpStatus.OK,
        message: '맛집인이 성공적으로 검색하었습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
