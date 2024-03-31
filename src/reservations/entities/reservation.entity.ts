import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsEnum } from "class-validator";
import { Status } from "../types/status.type";
import { Place } from "src/places/entities/place.entity";
import { User } from "src/users/entities/user.entity";
import { Mission } from "src/missions/entities/mission.entity";
import { Review } from "src/reviews/entities/review.entity";

@Entity({ name: "reservations" })
export class Reservation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false})
    userId: number;

    @Column({ type: 'int', nullable: true})
    placeId: number;

    @Column({ type: 'int', nullable: true})
    missionId: number;

    @IsEnum(Status)
    @Column({ type: 'enum', enum: Status, nullable: false, default: Status.BEFORE_VISIT })
    status: Status;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => Review, (review) => review.reservation)
    reviews: Review[];

    @ManyToOne(() => User, (user) => user.reservations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: User;

    @ManyToOne(() => Place, (place) => place.reservations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'placeId', referencedColumnName: 'id' })
    place: Place;

    @ManyToOne(() => Mission, (mission) => mission.reservations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'missionId', referencedColumnName: 'id' })
    mission: Mission;
}
