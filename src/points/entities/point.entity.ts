import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { IsDate, IsEmail, IsEnum, IsNumber, IsString } from "class-validator";

@Entity({ name: "points" })
export class Point {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false })
    userId: number;

    @IsNumber()
    @Column({ type: 'int', nullable: false })
    point: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
