import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Gender } from "../types/gender.types";
import { IsDate, IsEmail, IsEnum, IsString } from "class-validator";

@Entity({ name: "users" })
@Unique(["email"])
@Unique(["phone"])
export class Users {
    @PrimaryGeneratedColumn()
    id: number;

    @IsEmail()
    @Column({ type: 'varchar', unique: true, nullable: false })
    email: string;

    @Column({ type: 'varchar'})
    profileImage: string;

    @IsString()
    @Column({ type: 'varchar', nullable: false })
    name: string;

    @IsString()
    @Column({ type: 'varchar', select: false, nullable: false })
    password: string;

    @IsDate()
    @Column({ type: 'date', nullable: false })
    birth: Date;

    @IsEnum(Gender, { message: '올바른 성별을 선택하세요.' })
    @Column({ type: 'enum', enum: Gender, nullable: false })
    gender: Gender;

    @IsString()
    @Column({ type: 'varchar', unique: true, nullable: false })
    phone: string;

    @IsString()
    @Column({ type: 'varchar', unique: true, nullable: false })
    nickName: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
