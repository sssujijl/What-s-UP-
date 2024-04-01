import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { DataSource, Repository } from 'typeorm';
import { ResStatus } from './entities/resStatus.entity';
import { Order_Menus } from './entities/orderMenus.entity';
import { MenusService } from 'src/menus/menus.service';
import { PointsService } from 'src/points/points.service';
import { Status } from './types/status.type';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation) private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(ResStatus) private readonly resStatusRepository: Repository<ResStatus>,
    @InjectRepository(Order_Menus) private readonly orderMenuRepository: Repository<Order_Menus>,
    private dataSource: DataSource,
    private readonly menuService: MenusService,
    private readonly pointService: PointsService
  ) {}

  async findReservationsByUserId(userId: number) {
    const reservations = await this.reservationRepository.findBy({ userId });

    if (!reservations) {
      throw new NotFoundException('해당 유저의 예약목록을 찾을 수 없습니다.');
    }

    return reservations;
  }

  async createReservation(resStatusId: number, createReservationDto: CreateReservationDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const resStatus = await this.findResStatusById(resStatusId);

      if (resStatus.status === false) {
        throw new Error('해당 장소에 예약이 불가능한 상태입니다.');
      }

      if (createReservationDto.capacity === 0) {
        throw new Error('예약 인원 수는 1명 이상부터 가능합니다.');
      }

      const order = await this.findOrderMenus(resStatus.placeId, createReservationDto.orderMenus);

      if (resStatus.mission) {
        order.totalAmount =- 1000;
      }

      await this.pointService.updatePoint(createReservationDto.userId, order.totalAmount);

      const reservation = await queryRunner.manager.save(Reservation, {
        userId: createReservationDto.userId,
        resStatusId: resStatus.id,
        capacity: createReservationDto.capacity,
        totalAmount: order.totalAmount
      });

      for (const orderId of order.orders) {
        orderId.reservationId = reservation.id;
      }

      await queryRunner.manager.save(Order_Menus, order.orders);

      await queryRunner.commitTransaction();

      return reservation;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return { message: `${err}` }
    } finally {
      await queryRunner.release();
    }
  }

  async findResStatusById(resStatusId: number) {
    const resStatus = await this.resStatusRepository.findOneBy({ id: resStatusId });

    if (!resStatus) {
      throw new NotFoundException('해당 예약상태정보를 찾을 수 없습니다.');
    }

    return resStatus;
  }

  async findOrderMenus(placeId: number, orderMenus: Record<number, number>) {
    const menuIds = Object.keys(orderMenus).map(Number);

    const menus = await this.menuService.findByPlaceIdAndMenuIds(placeId, menuIds);

    let totalAmount = 0;
    const orders = menus.map((menu) => {
      const quantity = orderMenus[menu.id];
      const price = menu.price;
      const totalPrice = quantity * price;
      const reservationId = 0;
      totalAmount += totalPrice;
      return {
        menuId: menu.id,
        quantity,
        totalPrice,
        reservationId
      };
    });

    return {totalAmount, orders};
  }

  async findOneById(userId: number, reservationId: number) {
    const reservation = await this.reservationRepository.findOne({
      where: {
        userId,
        id: reservationId
      },
    });

    if (!reservation) {
      throw new NotFoundException('해당 유저의 예약을 찾을 수 없습니다.');
    }

    return reservation;
  }

  async cancelReservation(userId: number, reservationId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reservation = await this.findOneById(userId, reservationId);

      await queryRunner.manager.update(ResStatus, 
        reservation.resStatusId, 
        { status: true }
      );

      await queryRunner.manager.delete(Order_Menus, reservation.id);

      await this.pointService.cancelPoint(userId, reservation.totalAmount);

      reservation.deletedAt = new Date();
      reservation.status = Status.RESERVATION_CANCELLED;
      const cancelReservation = await queryRunner.manager.save(Reservation, reservation);

      await queryRunner.commitTransaction();

      return cancelReservation;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return { message: `${err}` }
    } finally {
      await queryRunner.release();
    }
  }

  async changeReservationStatus(reservationId: number) {
    
  }
}
