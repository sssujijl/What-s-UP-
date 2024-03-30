import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsDate, IsEnum, IsNumber } from "class-validator";
import { Status } from "../types/status.type";

@Entity({ name: "coupons" })
export class Coupons {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false})
    userId: number;

    @Column({ type: 'int', nullable: true})
    placeId: number;

    @Column({ type: 'int', nullable: true})
    missionId: number;

    @IsNumber()
    @Column({ type: 'int', nullable: false })
    discount: number;

    @IsEnum(Status)
    @Column({ type: 'enum', enum: Status, nullable: false, default: Status.usage_before })
    status: Status;

    @IsDate()
    @Column({ type: 'date', nullable: false })
    expiryDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
