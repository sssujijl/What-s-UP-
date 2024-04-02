import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { FoodiesService } from './foodies.service';
import { CreateFoodieDto } from './dto/create-foodie.dto';
import { UpdateFoodieDto } from './dto/update-foodie.dto';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/users/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { validate } from 'class-validator';

@Controller('foodies')
export class FoodiesController {
  constructor(
    private readonly foodiesService: FoodiesService
  ) { }

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
      return await this.foodiesService.createFoodie(createFoodieDto);
    } catch (err) {
      return { message: `${err}` };
    }
  }

  // 게시물 전체조회
  @Get()
  async findAllFoodies() {
    try {
      return await this.foodiesService.findAllFoodies();
    } catch (err) {
      return { message: `${err}` };
    }
  }

  // 게시물 상세조회
  @Get('/:foodieId')
  async findFoodie(
    @Param("foodieId") foodieId: number,
    @Req() req: any
  ) {
    try {
      const userIP = req.ip;
      return await this.foodiesService.findOneById(foodieId);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  // 게시물 수정
  @UseGuards(AuthGuard('jwt'))
  @Patch('/:foodieId')
  async updateFoodie(
    @Param("foodieId") foodieId: number,
    @UserInfo() user: User,
    @Body() updateFoodieDto: UpdateFoodieDto
  ) {
    try {
      return await this.foodiesService.updateFoodie(foodieId, user.id, updateFoodieDto);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  // 게시물 삭제
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:foodieId')
  async deleteFoodie(
    @Param("foodieId") foodieId: number,
    @UserInfo() user: User,
  ) {
    try {
      return await this.foodiesService.deleteFoodie(foodieId, user.id);
    } catch (err) {
      return { message: `${err}`}
    }
  }


}
