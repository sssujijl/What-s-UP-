import { Controller, Post, Body, UseGuards, Query, Param, Get, Delete, Put } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { validate } from 'class-validator';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

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

      return await this.reservationsService.createReservation(resStatusId, createReservationDto);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findReservations(@UserInfo() user: User) {
    try {
      return await this.reservationsService.findReservationsByUserId(user.id);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:reservationId')
  async findOneById(
    @UserInfo() user: User,
    @Param('reservationId') reservationId: number
  ) {
    try {
      return await this.reservationsService.findOneById(user.id, reservationId);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/:reservationId')
  async cancelReservation(
    @UserInfo() user: User,
    @Param('reservationId') reservationId: number
  ) {
    try {
      return await this.reservationsService.cancelReservation(user.id, reservationId);
    } catch (err) {
      return { message: `${err}` }
    }
  }

  @Put('/:reservationId')
  async changeReservationStatus(@Param('reservationId') reservationId: number) {
    try {
      return await this.reservationsService.changeReservationStatus(reservationId);
    } catch (err) {
      return { message: `${err}` }
    }
  }
}
