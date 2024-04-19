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
import { PlacesService } from 'src/places/places.service';
import { validate } from 'class-validator';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/users/entities/user.entity';
import { ReservationsService } from 'src/reservations/reservations.service';
import { MissionsService } from 'src/missions/missions.service';

@ApiTags('Reviews')
@Controller('/place/:placeId/reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly placesService: PlacesService,
    private readonly reservationService: ReservationsService,
    private readonly missionService: MissionsService,
  ) {}

  /**
   * 리뷰 등록
   * @param placeId
   * @param reservationId?
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('/:reservationId?')
  async create(
    @Param('placeId') placeId: number,
    @Body() createReviewDto: CreateReviewDto,
    @UserInfo() user: User,
    @Param('reservationId') reservationId?: number,
  ) {
    try {
      const place = await this.placesService.findPlaceById(placeId);

      if (reservationId) {
        const reservation =
          await this.reservationService.findOneById(reservationId);
        if (reservation.resStatus.missionId) {
          const mission = await this.missionService.findMission(
            reservation.resStatus.missionId,
          );
          await this.missionService.updateMissionStatus(mission.id);
          const data = await this.reviewsService.addMissionReviewQueue(
            createReviewDto,
            user.id,
            reservationId,
            place,
            mission,
          );
          if (data) {
            return {
              statusCode: HttpStatus.CREATED,
              message: '미션 리뷰 생성에 성공했습니다!',
              data,
            };
          }
        }
      }

      const data = await this.reviewsService.create(
        createReviewDto,
        user.id,
        reservationId,
        place,
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: '일반 리뷰 생성에 성공했습니다.',
        data,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * 리뷰 상세 조회
   * @param placeId
   * @returns
   */
  @Get(':reviewId')
  async findOne(
    @Param('reviewId') reviewId: number,
    @Param('placeId') placeId: number,
  ) {
    await this.placesService.findPlaceById(placeId);
    const data = await this.reviewsService.findOne(reviewId);
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
   * @param reviewId
   * @param placeId
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch(':reviewId')
  async update(
    @Param('reviewId') reviewId: number,
    @Param('placeId') placeId: number,
    @Body() updateReviewDto: UpdateReviewDto,
    @UserInfo() user: User,
  ) {
    try {
      await validate(updateReviewDto);

      await this.placesService.findPlaceById(placeId);

      updateReviewDto.userId = user.id;
      await this.reviewsService.update(reviewId, updateReviewDto);
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
   * @param placeId
   * @returns
   */
  @Get()
  async findAll(@Param('placeId') placeId: number) {
    await this.placesService.findPlaceById(placeId);

    const data = await this.reviewsService.findAll(placeId);

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
   * @param reviewId
   * @param placeId
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete(':reviewId')
  async remove(
    @Param('reviewId') reviewId: number,
    @Param('placeId') placeId: number,
    @UserInfo() user: User,
  ) {
    try {
      await this.placesService.findPlaceById(placeId);

      await this.reviewsService.remove(reviewId, user.id);
      return {
        statusCode: HttpStatus.OK,
        message: '리뷰 삭제에 성공했습니다.',
      };
    } catch (error) {
      throw new BadRequestException('리뷰 삭제에 실패했습니다.');
    }
  }
}
