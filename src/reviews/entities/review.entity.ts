import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsDate, IsEnum, IsNumber, IsString } from "class-validator";
import { Rating } from "../types/rating.types";
import { Reservation } from "src/reservations/entities/reservation.entity";
import { Place } from "src/places/entities/place.entity";
import { User } from "src/users/entities/user.entity";

@Entity({ name: "reviews" })
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false })
    userId: number;

    @Column({ type: 'int', nullable: false })
    placeId: number;

    @Column({ type: 'int', nullable: true })
    reservationId: number;

    @Column({ type: 'varchar', nullable: true })
    images: string;

    @IsString()
    @Column({ type: 'varchar', nullable: false })
    content: string;

    @IsEnum(Rating)
    @Column({ type: 'enum', enum: Rating, nullable: true })
    rating: Rating;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToOne(() => Reservation, (reservation) => reservation.review)
    @JoinColumn({ name: 'reservationId', referencedColumnName: 'id' })
    reservation: Reservation;

    @ManyToOne(() => User, (user) => user.reviews)
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: User;

    @ManyToOne(() => Place, (place) => place.reviews, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'placeId', referencedColumnName: 'id' })
    place: Place;
}
