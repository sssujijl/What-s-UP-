import { IsString } from "class-validator";
import { ChatRoom } from "src/chat-rooms/entites/chat-room.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @ManyToOne(() => User, (user) => user.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: User;

    @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'chatRoomId', referencedColumnName: 'id' })
    chatRoom: ChatRoom;
}
