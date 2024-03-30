import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsDate, IsEnum, IsNumber, IsString } from "class-validator";
import { Status } from "../types/status.type";

@Entity({ name: "foodies" })
export class Foodie {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false})
    userId: number;

    @Column({ type: 'int', nullable: false})
    titleId: number;

    @IsString()
    @Column({ type: 'varchar', nullable: false })
    title: string;

    @IsString()
    @Column({ type: 'varchar', nullable: false })
    content: string;

    @IsString()
    @Column({ type: 'varchar', nullable: true })
    images: string;

    @IsNumber()
    @Column({ type: 'int', nullable: false, default: 0 })
    likes: number;

    @IsNumber()
    @Column({ type: 'int', nullable: false, default: 0 })
    views: number;

    @IsEnum(Status)
    @Column({ type: 'enum', enum: Status, nullable: false, default: Status.BEFORE_ANSWER })
    status: Status;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
