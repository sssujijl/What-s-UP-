import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation) private readonly reservationRepository: Repository<Reservation>
  ) {}

  async findReservationsByUserId(userId: number) {
    const reservations = await this.reservationRepository.findBy({ userId });

    if (!reservations) {
      throw new NotFoundException('해당 유저의 예약목록을 찾을 수 없습니다.');
    }

    return reservations;
  }
}
