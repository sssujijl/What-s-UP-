import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ResStatus } from './entities/resStatus.entity';
import { Order_Menus } from './entities/orderMenus.entity';
import { MenusModule } from 'src/menus/menus.module';
import { PointsModule } from 'src/points/points.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, ResStatus, Order_Menus]), 
    MenusModule,
    PointsModule
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService]
})
export class ReservationsModule {}
