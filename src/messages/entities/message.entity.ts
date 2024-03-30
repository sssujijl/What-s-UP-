import { IsString } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'messages' })
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false })
    userId: number;

    @Column({ type: 'int', nullable: false })
    chatRoomId: number;

    @IsString()
    @Column({ type: 'varchar', nullable: false })
    content: string;

    @IsString()
    @Column({ type: 'varchar', nullable: true })
    images: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
