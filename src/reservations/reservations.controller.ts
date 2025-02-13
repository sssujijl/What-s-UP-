import { Controller, Post, Body, UseGuards, Query, Param, Get, Delete, Put, HttpStatus } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { validate } from 'class-validator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  /**
   * 예약하기
   * @param resStatusId 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('/:resStatusId')
  async createReservation(
    @Param('resStatusId') resStatusId: number,
    @UserInfo() user: User,
    @Body() createReservationDto: CreateReservationDto
  ) {
    try {
      await validate(createReservationDto);
      createReservationDto.userId = user.id;

      const data = await this.reservationsService.addReservationQueue(resStatusId, createReservationDto);
      return {
        statusCode: HttpStatus.OK,
        message: '예약중입니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  /**
   * 예약 목록보기
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findReservations(@UserInfo() user: User) {
    try {
      const data = await this.reservationsService.findReservationsByUserId(user.id);
      return {
        statusCode: HttpStatus.OK,
        message: '예약목록을 성공적으로 조회하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  /**
   * 예약 상세보기
   * @param reservationId 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('/:reservationId')
  async findOneById(
    @UserInfo() user: User,
    @Param('reservationId') reservationId: number
  ) {
    try {
      const data = await this.reservationsService.findOneById(reservationId);
      return {
        statusCode: HttpStatus.OK,
        message: '예약을 성공적으로 조회하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  /**
   * 예약 취소하기
   * @param reservationId 
   * @returns 
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:resStatusId/:reservationId')
  async cancelReservation(
    @UserInfo() user: User,
    @Param('resStatusId') resStatusId: number,
    @Param('reservationId') reservationId: number
  ) {
    try {
      const data = await this.reservationsService.cancelReservation(user.id, resStatusId, reservationId);
      return {
        statusCode: HttpStatus.OK,
        message: '예약을 성공적으로 취소했습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }

  /**
   * 가게별 예약상태 찾기
   * @param placeId 
   * @param date 
   * @returns 
   */
  @Get('/places/:placeId')
  async findAllResStatue(
    @Param('placeId') placeId: number,
    @Query('date') date: string
  ) {
    try {
      const data = await this.reservationsService.findAllResStatue(placeId, date);
      return {
        statusCode: HttpStatus.OK,
        message: '가게별 예약상태를 성공적으로 조회하였습니다.',
        data
      };
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
