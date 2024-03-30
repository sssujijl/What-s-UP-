import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsDate, IsEnum, IsNumber, IsString } from "class-validator";
import { Status } from "../types/status.type";
import { Gender } from "../types/gender.type";
import { Age } from "../types/age.type";

@Entity({ name: "foodmates" })
export class FoodMate {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: true})
    userId: number;

    @Column({ type: 'int', nullable: true})
    foodCategoryId: number;

    @IsString()
    @Column({ type: 'varchar', nullable: false })
    content: string;

    @IsString()
    @Column({ type: 'varchar', nullable: false })
    region: string;

    @IsNumber()
    @Column({ type: 'int', nullable: false })
    capacity: number;

    @IsNumber()
    @Column({ type: 'int', nullable: false, default: 0 })
    views: number;

    @IsEnum(Status)
    @Column({ type: 'enum', enum: Status, nullable: false, default: Status.BEFORE_RECRUITMENT })
    status: Status;

    @IsEnum(Gender)
    @Column({ type: 'enum', enum: Gender, nullable: false })
    gender: Gender;

    @IsEnum(Age)
    @Column({ type: 'enum', enum: Age, nullable: false })
    age: Age;

    @IsDate()
    @Column({ type: 'datetime', nullable: false })
    dateTime: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
