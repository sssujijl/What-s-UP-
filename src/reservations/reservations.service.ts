import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { DataSource, Repository } from 'typeorm';
import { ResStatus } from './entities/resStatus.entity';
import { Order_Menus } from './entities/orderMenus.entity';
import { MenusService } from 'src/menus/menus.service';
import { PointsService } from 'src/points/points.service';
import { Status } from './types/reservation.status.type';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { format, formatDate } from 'date-fns';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(ResStatus)
    private readonly resStatusRepository: Repository<ResStatus>,
    @InjectRepository(Order_Menus)
    private readonly orderMenusRepository: Repository<Order_Menus>,
    private dataSource: DataSource,
    private readonly menuService: MenusService,
    private readonly pointService: PointsService,
    @InjectQueue('reservationQueue') private reservationQueue: Queue,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async findReservationsByUserId(userId: number) {
    const reservations = await this.reservationRepository.find({
      where: { userId },
      relations: ['resStatus', 'resStatus.place', 'review'],
      order: {
        status: 'ASC',
        updatedAt: 'DESC',
      },
    });

    if (!reservations) {
      throw new NotFoundException('해당 유저의 예약목록을 찾을 수 없습니다.');
    }

    return reservations;
  }

  async addReservationQueue(
    resStatusId: number,
    createReservationDto: CreateReservationDto,
  ) {
    const job = await this.reservationQueue.add(
      'reservation',
      {
        resStatusId,
        createReservationDto,
      },
      { removeOnComplete: true, removeOnFail: true },
    );

    return { message: '예약중입니다.' };
  }

  async createReservation(
    resStatusId: number,
    createReservationDto: CreateReservationDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let resStatus: ResStatus;
      const today = new Date().toISOString().slice(0, 10);

      if (createReservationDto.checkMission === true) {
        resStatus = await this.cacheManager.get(`Mission: ${today}: resStatus: ${resStatusId}`)
      } else {
        resStatus = await this.findResStatusById(resStatusId);
      }
      

      if (resStatus.status === false) {
        throw new Error('해당 장소에 예약이 불가능한 상태입니다.');
      }

      if (createReservationDto.capacity === 0) {
        throw new Error('예약 인원 수는 1명 이상부터 가능합니다.');
      }

      const order = await this.findOrderMenus(
        resStatus.placeId,
        createReservationDto.orderMenus,
      );

      if (resStatus.missionId) {
        order.totalAmount -= 1000;
      } else if (createReservationDto.deposit) {
        order.totalAmount += createReservationDto.deposit;
      }

      await this.pointService.updatePoint(
        createReservationDto.userId,
        order.totalAmount,
      );

      const reservation = await queryRunner.manager.save(Reservation, {
        userId: createReservationDto.userId,
        resStatusId: resStatus.id,
        capacity: createReservationDto.capacity,
        totalAmount: order.totalAmount,
      });

      for (const orderId of order.orders) {
        orderId.reservationId = reservation.id;
      }

      if (order) {
        await queryRunner.manager.save(Order_Menus, order.orders);
      }
      console.log(order)
      resStatus.status = false;
      await queryRunner.manager.save(ResStatus, resStatus);
      console.log(resStatus)
      if (resStatus.missionId) {
        await this.cacheManager.set(
          `Mission: ${today}: resStatus: ${resStatus.id}`,
          resStatus,
        );
      }

      await queryRunner.commitTransaction();

      return reservation;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return { message: `${err}` };
    } finally {
      await queryRunner.release();
    }
  }

  async findResStatusById(resStatusId: number) {
    const resStatus = await this.resStatusRepository.findOneBy({
      id: resStatusId,
    });

    if (!resStatus) {
      throw new NotFoundException('해당 예약상태정보를 찾을 수 없습니다.');
    }

    return resStatus;
  }

  async findOrderMenus(placeId: number, orderMenus: Record<number, number>) {
    const menuIds = Object.keys(orderMenus).map(Number);

    const menus = await this.menuService.findByPlaceIdAndMenuIds(
      placeId,
      menuIds,
    );

    let totalAmount = 0;
    const orders = menus.map((menu) => {
      const quantity = orderMenus[menu.id];
      const price = +menu.price.replace(/[^\d]/g, '');
      const totalPrice = quantity * price;
      const reservationId = 0;
      totalAmount += totalPrice;
      return {
        menuId: menu.id,
        quantity,
        totalPrice,
        reservationId,
      };
    });

    return { totalAmount, orders };
  }

  async findOneById(reservationId: number) {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['resStatus'],
    });

    if (!reservation) {
      throw new NotFoundException('해당 유저의 예약을 찾을 수 없습니다.');
    }

    return reservation;
  }

  async cancelReservation(
    userId: number,
    resStatusId: number,
    reservationId: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reservation = await this.findOneById(reservationId);
      const resStatus = await this.findResStatusById(resStatusId);

      if (reservation.status === Status.VISIT_COMPLETED) {
        throw new Error('이미 방문한 예약입니다.');
      }

      await queryRunner.manager.update(ResStatus, resStatus.id, {
        status: true,
      });

      const orderMenus = await this.orderMenusRepository.findBy({
        reservationId,
      });
      if (orderMenus.length > 0) {
        await queryRunner.manager.delete(Order_Menus, reservation.id);
      }

      await this.pointService.cancelPoint(userId, reservation.totalAmount);
      console.log(reservation);
      reservation.status = Status.RESERVATION_CANCELLED;
      console.log(reservation);
      const cancelReservation = await queryRunner.manager.save(
        Reservation,
        reservation,
      );

      resStatus.status = true;
      await queryRunner.manager.save(ResStatus, resStatus);

      if (resStatus.missionId) {
        await this.cacheManager.set(
          `Mission_resStatus: ${resStatus.id}`,
          resStatus,
        );
      }

      await queryRunner.commitTransaction();

      return cancelReservation;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return { message: `${err}` };
    } finally {
      await queryRunner.release();
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    const reservations = await this.reservationRepository.find({
      where: { status: Status.BEFORE_VISIT },
      relations: ['resStatus'],
    });

    const currentTime = new Date();
    for (const reservation of reservations) {
      const differenceInMinutes =
        (currentTime.getTime() - reservation.resStatus.dateTime.getTime()) /
        (1000 * 60);
      if (differenceInMinutes >= 10) {
        await this.changeReservation(reservation);
      }
    }
  }

  async changeReservation(reservation: Reservation) {
    reservation.status = Status.VISIT_COMPLETED;

    return await this.reservationRepository.save(reservation);
  }

  async findAllResStatue(placeId: number, date: string) {
    const formattedDate = format(date, 'yyyy-MM-dd');

    const resStatus = await this.resStatusRepository
      .createQueryBuilder('resStatus')
      .where('resStatus.placeId = :placeId', { placeId })
      .andWhere(
        'DATE_FORMAT(resStatus.dateTime, "%Y-%m-%d") = :formattedDate',
        { formattedDate },
      )
      .orderBy('resStatus.dateTime', 'ASC')
      .getMany();

    if (!resStatus || resStatus.length === 0) {
      throw new NotFoundException('해당 가게의 예약 목록을 찾을 수 없습니다.');
    }

    return resStatus;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async createResStatus() {
    const keys = await this.redis.keys('PlaceIds: *동*');

    const placeIds = await Promise.all(
      keys.map(async (key) => {
        return await this.redis.smembers(key);
      }),
    );

    const today = new Date().toISOString().slice(0, 10);

    const promises = [];
    placeIds.forEach((ids) => {
      ids.forEach((placeId) => {
        for (let hour = 10; hour <= 21; hour++) {
          const dateTime = `${today}T${hour.toString().padStart(2, '0')}:00:00`;
          const resStatus = {
            placeId: +placeId,
            dateTime: dateTime,
          };
          promises.push(this.resStatusRepository.save(resStatus));
        }
      });
    });

    // 모든 예약 상태가 생성될 때까지 기다림
    await Promise.all(promises);

    return '완료';
  }
}
