import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * 리뷰 등록
   * @param createReviewDto
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createReviewDto: CreateReviewDto) {
    try {
      const data = await this.reviewsService.create(createReviewDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: '리뷰 생성에 성공했습니다.',
        data,
      };
    } catch (error) {
      throw new BadRequestException('리뷰 생성에 실패했습니다.');
    }
  }

  /**
   * 리뷰 상세 조회
   * @returns
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.reviewsService.findOne(+id);
    if (!data) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: '리뷰를 찾을 수 없습니다.',
        data,
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: '리뷰 조회에 성공했습니다.',
      data,
    };
  }

  /**
   * 리뷰 수정
   * @param id
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    try {
      await this.reviewsService.update(+id, updateReviewDto);
      return {
        statusCode: HttpStatus.OK,
        message: '리뷰 수정에 성공했습니다.',
      };
    } catch (error) {
      throw new BadRequestException('리뷰 수정에 실패했습니다.');
    }
  }

  /**
   * 리뷰 목록 조회
   * @returns
   */
  @Get()
  async findAll() {
    const data = await this.reviewsService.findAll();

    if (!data.length) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: '보드 목록이 존재하지 않습니다.',
        data,
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: '리뷰 목록 조회에 성공했습니다.',
      data,
    };
  }

  /**
   * 리뷰 삭제
   * @param id
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.reviewsService.remove(+id);
      return {
        statusCode: HttpStatus.OK,
        message: '리뷰 삭제에 성공했습니다.',
      };
    } catch (error) {
      throw new BadRequestException('리뷰 삭제에 실패했습니다.');
    }
  }
}
