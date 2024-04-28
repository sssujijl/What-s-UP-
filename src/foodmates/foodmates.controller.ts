import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
  BadRequestException,
  Req,
  Query,
} from '@nestjs/common';
import { FoodmatesService } from './foodmates.service';
import { CreateFoodmateDto } from './dto/create-foodmate.dto';
import { UpdateFoodmateDto } from './dto/update-foodmate.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/users/entities/user.entity';
import { validate } from 'class-validator';

@ApiTags('Foodmates')
@Controller('foodmates')
export class FoodmatesController {
  constructor(private readonly foodmatesService: FoodmatesService) { }

  /**
   * 밥친구 글 등록
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @Body() createFoodmateDto: CreateFoodmateDto,
    @UserInfo() user: User
  ) {
    try {
      await validate(createFoodmateDto);

      createFoodmateDto.userId = user.id;
      const data = await this.foodmatesService.create(createFoodmateDto);
      return {
        statusCode: HttpStatus.OK,
        message: '밥친구 게시물이 성공적으로 생성되었습니다.',
        data
      };
    } catch (error) {
      return { message: `${error}` }
    }
  }

  /**
   * 밥친구 목록 조회
   * @returns
   */
  @Get()
  async findAll(
    @Query('orderBy') orderBy: string,
    @Query('category') category: string,
    @Query('region') region: string,
  ) {
    try {
      const data = await this.foodmatesService.findAll(orderBy, category, region);

      return {
        statusCode: HttpStatus.OK,
        message: '밥친구 게시물 목록을 성공적으로 조회하었습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  /**
   * 밥친구 상세 조회
   * @param id
   * @returns
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    try {
      const userIP = req.ip;

      const data = await this.foodmatesService.findOne(+id, userIP);
      return {
        statusCode: HttpStatus.OK,
        message: '밥친구 게시물을 성공적으로 조회되었습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  /**
   * 밥친구 수정
   * @param id
   * @param updateFoodmateDto
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFoodmateDto: UpdateFoodmateDto,
  ) {
    try {
      const data = await this.foodmatesService.update(+id, updateFoodmateDto);
      return {
        statusCode: HttpStatus.OK,
        message: '밥친구 게시물을 성공적으로 수정하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  /**
   * 보드 삭제
   * @param id
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(
    @UserInfo() user: User,
    @Param('id') id: string
  ) {
    try {
      const data =await this.foodmatesService.remove(+id, user);
    return {
      statusCode: HttpStatus.OK,
      message: '밥친구 게시물이 성공적으로 삭제되었습니다.',
      data
    };
    } catch (err) {
      return { message: `${err}` }
    }
    
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/application')
  async applicationFoodMate(
    @Param('id') id: number,
    @UserInfo() user: User
  ) {
    try {
      const data = await this.foodmatesService.applicationFoodMate(user, id);
      return {
        statusCode: HttpStatus.OK,
        message: '성공적으로 밥친구 신청이 되었습니다.',
        data
      }
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
