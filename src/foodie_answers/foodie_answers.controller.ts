import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus } from '@nestjs/common';
import { FoodieAnswersService } from './foodie_answers.service';
import { CreateFoodieAnswerDto } from './dto/create-foodie_answer.dto';
import { UpdateFoodieAnswerDto } from './dto/update-foodie_answer.dto';
import { FoodiesService } from 'src/foodies/foodies.service';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/users/entities/user.entity';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import { validate } from 'class-validator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Foodie_Answer')
@Controller('/foodie/:foodieId/foodie_answer')
export class FoodieAnswersController {
  constructor(
    private readonly foodieAnswersService: FoodieAnswersService,
    private readonly foodiesService: FoodiesService,
  ) { }

  /**
   * 맛집인 답글 등록
   * @param foodieId
   * @example "인정하는 부분입니다."
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createAnswer(
    @Param('foodieId') foodieId: number,
    @UserInfo() user: User,
    @Body() createFoodieAnswerDto: CreateFoodieAnswerDto
  ) {
    try {
      await validate(createFoodieAnswerDto);
      
      const foodie = await this.foodiesService.findOneById(foodieId);
      createFoodieAnswerDto.foodieId = foodieId;

      createFoodieAnswerDto.userId = user.id;

      const data = await this.foodieAnswersService.createAnswer(foodie, createFoodieAnswerDto);
      return {
        statusCode: HttpStatus.OK,
        message: '답글이 성공적으로 생성되었습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` };
    }
  }

  // 칭호레벨 확인로직
  @UseGuards(AuthGuard('jwt'))
  @Get('validate')
  async checkTitle(
    @Param("foodieId") foodieId: number,
    @UserInfo() user: User
  ) {
    try {
      const foodie = await this.foodiesService.findOneById(foodieId);

      const data = await this.foodieAnswersService.checkTitle(foodie, user);
      return {
        statusCode: HttpStatus.OK,
        message: '칭호를 성공적으로 확인하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` };
    }
  }

  /**
   * 맛집인 답글 목록 조회
   * @param foodieId
   * @returns
   */
  @Get()
  async findAllAnswers(
    @Param("foodieId") foodieId: number
  ) {
    try {
      await this.foodiesService.findOneById(foodieId);

      const data = await this.foodieAnswersService.findAllAnswers(foodieId);
      return {
        statusCode: HttpStatus.OK,
        message: '답글이 성공적으로 조회되었습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` };
    }
  }

  /**
   * 맛집인 답글 수정
   * @param foodieId
   * @param foodieAnswerId
   * @example "인정 못합니다."
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch('/:foodieAnswerId')
  async updateAnswer(
    @Param("foodieId") foodieId: number,
    @Param("foodieAnswerId") foodieAnswerId: number,
    @UserInfo() user: User,
    @Body() updateFoodieAnswerDto: UpdateFoodieAnswerDto
  ) {
    try {
      await validate(updateFoodieAnswerDto);

      await this.foodiesService.findOneById(foodieId);

      const data = await this.foodieAnswersService.updateAnswer(foodieAnswerId, user.id, updateFoodieAnswerDto);
      return {
        statusCode: HttpStatus.OK,
        message: '답글이 성공적으로 수정되었습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  /**
   * 맛집인 답글 삭제
   * @param foodieId
   * @param foodieAnswerId
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:foodieAnswerId')
  async deleteAnswer(
    @Param("foodieId") foodieId: number,
    @Param("foodieAnswerId") foodieAnswerId: number,
    @UserInfo() user: User
  ) {
    try {
      await this.foodiesService.findOneById(foodieId);

      const data = await this.foodieAnswersService.deleteAnswer(foodieAnswerId, user.id);
      return {
        statusCode: HttpStatus.OK,
        message: '답글을 성공적으로 삭제하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }


}
