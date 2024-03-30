import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsDate, IsEnum, IsNumber, IsString } from "class-validator";
import { Status } from "../types/status.type";

@Entity({ name: "foodie_answers" })
export class Foodie_Answer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false})
    userId: number;

    @IsString()
    @Column({ type: 'varchar', nullable: false })
    content: string;

    @IsString()
    @Column({ type: 'varchar', nullable: true })
    images: string;

    @IsEnum(Status)
    @Column({ type: 'enum', enum: Status, nullable: false, default: Status.BEFORE_ADOPTION })
    status: Status;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
