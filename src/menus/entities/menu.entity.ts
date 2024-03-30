import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsDate, IsEnum, IsNumber, IsString } from "class-validator";

@Entity({ name: "menus" })
export class Menu {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false})
    placeId: number;

    @IsString()
    @Column({ type: 'varchar', nullable: false })
    name: string;

    @IsString()
    @Column({ type: 'varchar', nullable: true })
    description: string;

    @IsString()
    @Column({ type: 'varchar', nullable: true })
    images: string;

    @IsNumber()
    @Column({ type: 'int', nullable: false })
    price: number;
}
