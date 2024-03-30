import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IsEnum } from "class-validator";
import { level } from "../types/level.type";

@Entity({ name: "titles" })
export class Titles {
    @PrimaryGeneratedColumn()
    id: number;

    @IsEnum(level)
    @Column({ type: 'enum', enum: level, nullable: false})
    level: level;
}
