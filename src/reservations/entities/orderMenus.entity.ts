import { IsNumber } from "class-validator";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Reservation } from "./reservation.entity";
import { Menu } from "src/menus/entities/menu.entity";

@Entity({ name: 'order_Menus'})
export class Order_Menus {
    @PrimaryColumn()
    reservationId: number;

    @PrimaryColumn()
    menuId: number;

    @IsNumber()
    @Column({ type: 'int', nullable: false})
    quantity: number;

    @IsNumber()
    @Column({ type: 'int', nullable: false})
    totalPrice: number;

    @ManyToOne(() => Reservation, (reservation) => reservation.orderMenus)
    @JoinColumn({ name: 'reservationId', referencedColumnName: 'id' })
    reservation: Reservation;

    @ManyToOne(() => Menu, (menu) => menu.orderMenus, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'menuId', referencedColumnName: 'id' })
    menu: Menu;
}