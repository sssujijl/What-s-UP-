import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsDate, IsEnum, IsNumber, IsString } from "class-validator";
import { Status } from "../types/status.types";
import { Time } from "../types/mission_time.type";
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

    @IsString()
    @Column({ type: 'varchar', nullable: false })
    date: string;

    @IsEnum(Time)
    @Column({ type: 'enum', enum: Time, nullable: false })
    time: Time;

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
