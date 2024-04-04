import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsEnum, IsNumber } from "class-validator";
import { Status } from "../types/status.type";
import { User } from "src/users/entities/user.entity";
import { Review } from "src/reviews/entities/review.entity";
import { ResStatus } from "./resStatus.entity";
import { Order_Menus } from "./orderMenus.entity";

@Entity({ name: "reservations" })
export class Reservation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false})
    userId: number;

    @Column({ type: 'int', nullable: true})
    resStatusId: number;

    @IsNumber()
    @Column({ type: 'int', nullable: false})
    capacity: number;

    @IsEnum(Status)
    @Column({ type: 'enum', enum: Status, nullable: false, default: Status.BEFORE_VISIT })
    status: Status;

    @Column({ type: 'int', nullable: false})
    totalAmount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToOne(() => Review, (review) => review.reservation)
    review: Review;

    @ManyToOne(() => User, (user) => user.reservations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: User;

    @OneToOne(() => ResStatus, (resStatus) => resStatus.reservation)
    @JoinColumn({ name: 'resStatusId', referencedColumnName: 'id' })
    resStatus: ResStatus;

    @OneToMany(() => Order_Menus, (orderMenus) => orderMenus.reservation, { cascade: true })
    orderMenus: Order_Menus[];
}
