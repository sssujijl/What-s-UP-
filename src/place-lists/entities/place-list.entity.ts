import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { IsDate, IsEmail, IsEnum, IsNumber, IsString } from "class-validator";
import { Visible } from "../types/visible.type";

@Entity({ name: "placeLists" })
export class PlaceLists {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false})
    placeId: number;

    @IsString()
    @Column({ type: 'varchar', nullable: false })
    title: string;

    @IsString()
    @Column({ type: 'varchar', nullable: true })
    content: string;

    @IsEnum(Visible, { message: '올바른 공개범위를 선택해주세요.' })
    @Column({ type: 'enum', enum: Visible, nullable: false })
    visible: Visible;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
