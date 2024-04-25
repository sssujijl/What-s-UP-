import { Controller, Post, Body, UseGuards, Query, Param, Get, Delete, Put } from '@nestjs/common';
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

      return await this.reservationsService.addReservationQueue(resStatusId, createReservationDto);
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
      return await this.reservationsService.findReservationsByUserId(user.id);
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
      return await this.reservationsService.findOneById(reservationId);
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
  @Delete('/:reservationId')
  async cancelReservation(
    @UserInfo() user: User,
    @Param('resStatusId') resStatusId: number,
    @Param('reservationId') reservationId: number
  ) {
    try {
      return await this.reservationsService.cancelReservation(user.id, resStatusId, reservationId);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @Get('/place/:placeId')
  async findAllResStatue(@Param('placeId') placeId: number) {
    try {
      return await this.reservationsService.findAllResStatue(placeId);
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
