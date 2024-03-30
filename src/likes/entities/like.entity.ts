import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { IsDate, IsEmail, IsEnum, IsNumber, IsString } from "class-validator";

@Entity({ name: "likes" })
export class Like {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false })
    userId: number;

    @Column({ type: 'int', nullable: true })
    placeId: number;

    @Column({ type: 'int', nullable: true })
    foodieId: number;
}
