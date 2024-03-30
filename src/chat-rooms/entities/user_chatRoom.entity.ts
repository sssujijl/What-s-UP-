import { Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'user_chatRooms' })
export class User_ChatRoom {
    @PrimaryColumn()
    userId: number;

    @PrimaryColumn()
    chatRoomId: number;
}