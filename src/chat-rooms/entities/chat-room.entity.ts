import { IsString } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User_ChatRoom } from "./user_chatRoom.entity";
import { Message } from "src/messages/entities/message.entity";

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

    @OneToMany(() => User_ChatRoom, (userChatRoom) => userChatRoom.chatRoom, { cascade: true })
    userChatRooms: User_ChatRoom[];

    @OneToMany(() => Message, (message) => message.chatRoom, { cascade: true })
    messages: Message[];
}

