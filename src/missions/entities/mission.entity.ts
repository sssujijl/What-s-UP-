import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsEnum, IsNumber } from "class-validator";
import { Status } from "../types/status.types";
import { DateTime } from "../types/dateTime.type";
import { Place } from "src/places/entities/place.entity";
import { Reservation } from "src/reservations/entities/reservation.entity";
import { Coupon } from "src/coupons/entities/coupon.entity";
import { ResStatus } from "src/reservations/entities/resStatus.entity";

@Entity({ name: "missions" })
export class Mission {
    @PrimaryGeneratedColumn()
    id: number;

    @IsNumber()
    @Column({ type: 'int', nullable: false })
    capacity: number;

    @IsEnum(Status)
    @Column({ type: 'enum', enum: Status, nullable: false, default: Status.BEFORE_MISSION })
    status: Status;

    @IsEnum(DateTime)
    @Column({ type: 'enum', enum: DateTime, nullable: false })
    dateTime: DateTime;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => Coupon, (coupon) => coupon.mission, { cascade: true })
    coupons: Coupon[];

    @OneToMany(() => ResStatus, (resStatus) => resStatus.mission)
    resStatus: ResStatus[];
}
