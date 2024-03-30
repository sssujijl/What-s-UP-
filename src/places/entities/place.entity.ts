import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsDate, IsEnum, IsNumber, IsString } from "class-validator";

@Entity({ name: "places" })
export class Place {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false})
    foodCategoryId: number;

    @IsString()
    @Column({ type: 'varchar', nullable: false })
    title: string;

    @IsString()
    @Column({ type: 'varchar', nullable: true })
    link: string;

    @IsString()
    @Column({ type: 'varchar', nullable: true })
    description: string;

    @IsString()
    @Column({ type: 'varchar', nullable: true })
    telephone: string;

    @IsString()
    @Column({ type: 'varchar', nullable: false })
    address: string;

    @IsString()
    @Column({ type: 'varchar', nullable: false })
    roadAddress: string;

    @IsNumber()
    @Column({ type: 'int', nullable: false })
    mapx: number;

    @IsString()
    @Column({ type: 'int', nullable: false })
    mapy: number;

    @IsString()
    @Column({ type: 'int', nullable: false, default: 0 })
    likes: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
