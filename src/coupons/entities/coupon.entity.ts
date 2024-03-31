import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsDate, IsEnum, IsNumber } from "class-validator";
import { Status } from "../types/status.type";
import { User } from "src/users/entities/user.entity";
import { Place } from "src/places/entities/place.entity";
import { Mission } from "src/missions/entities/mission.entity";

@Entity({ name: "coupons" })
export class Coupon {
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

    @ManyToOne(() => User, (user) => user.coupons, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: User;

    @ManyToOne(() => Place, (place) => place.coupons, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'placeId', referencedColumnName: 'id' })
    place: Place;

    @ManyToOne(() => Mission, (mission) => mission.coupons, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'missionId', referencedColumnName: 'id' })
    mission: Mission;
}
