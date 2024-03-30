import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsDate, IsEnum, IsNumber, IsString } from "class-validator";
import { Rating } from "../types/rating.types";

@Entity({ name: "reviews" })
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false})
    reservationId: number;

    @IsString()
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
}
