import { IsString } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'chatRooms'})
export class ChatRoom {
    @PrimaryGeneratedColumn()
    id: number;

    @IsString()
    @Column({ type: 'varchar', nullable: false })
    name: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}

