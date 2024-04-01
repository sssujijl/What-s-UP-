import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FoodiesService } from './foodies.service';
import { CreateFoodieDto } from './dto/create-foodie.dto';
import { UpdateFoodieDto } from './dto/update-foodie.dto';
import { User } from 'src/users/entities/user.entity';
import { userInfo } from 'os';

@Controller('foodies')
export class FoodiesController {
  constructor(
    private readonly foodiesService: FoodiesService,) { }

  // 게시물 생성
  @Post('userId')
  async createFoodie(
    // @userInfo() user: User
    @Body() createFoodieDto: CreateFoodieDto
  ) {
    try {
      await this.foodiesService
      // createFoodieDto.userId = user.id;
    } catch (err) {
      return { message: `${err}` };
    }
  }

  // 게시물 전체조회
  @Get()
  async findAllFoodies() {
    try {

    } catch (err) {
      return { message: `${err}` };
    }
  }



  // 게시물 상세조회
  @Get('/:foodieId')
  async findFoodie(
    @Param("foodieId") foodieId: number
  ) {
    try {
      return await this.foodiesService.findOneById(foodieId);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  // 게시물 수정
  @Patch('/:foodieId')
  async updateFoodie(
    @Param("foodieId") foodieId: number,
    // @userInfo() user: User,
    @Body() updateFoodieDto: UpdateFoodieDto
  ) {
    try {
      await this.foodiesService.findOneById(foodieId);

      return await this.foodiesService.updateFoodie(foodieId, user.userId, updateFoodieDto)
    } catch (err) {
      return { message: `${err}` }
    }
  }

  // 게시물 삭제
  @Delete('/:foodieId')
  async deleteFoodie(
    @Param("foodieId") foodieId: number,
    // @userInfo() user: User
  ) {
    try {
      await this.foodiesService.findOneById(foodieId);

      return await this.foodiesService.findOneById(user.id)
    } catch (err) {
      return { message: `${err}`}
    }
  }


}
