import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsDate, IsEnum, IsNumber } from "class-validator";
import { Status } from "../types/status.types";
import { DateTime } from "../types/dateTime.type";

@Entity({ name: "missions" })
export class Mission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: true})
    placeId: number;

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
}
