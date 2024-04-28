import { User } from "src/users/entities/user.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { ChatRoom } from "./chat-room.entity";

@Entity({ name: 'user_chatRooms' })
export class User_ChatRoom {
    @PrimaryColumn()
    userId: number;

    @PrimaryColumn()
    chatRoomId: number;

    @ManyToOne(() => User, (user) => user.userChatRooms, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: User;

    @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.userChatRooms, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'chatRoomId', referencedColumnName: 'id' })
    chatRoom: ChatRoom;
}