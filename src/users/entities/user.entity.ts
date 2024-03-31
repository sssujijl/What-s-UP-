import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Gender } from "../types/gender.types";
import { IsDate, IsEmail, IsEnum, IsString } from "class-validator";
import { Point } from "src/points/entities/point.entity";
import { Saved_Place } from "src/place-lists/entities/savedPlaces.entity";
import { User_Title } from "src/titles/entities/user_titles.entity";
import { Follow } from "src/follows/entities/follow.entity";
import { Coupon } from "src/coupons/entities/coupon.entity";
import { User_ChatRoom } from "src/chat-rooms/entities/user_chatRoom.entity";
import { Message } from "src/messages/entities/message.entity";
import { Reservation } from "src/reservations/entities/reservation.entity";
import { Foodie } from "src/foodies/entities/foodie.entity";
import { Foodie_Answer } from "src/foodie_answers/entities/foodie_answer.entity";
import { FoodMate } from "src/foodmates/entities/foodmate.entity";
import { User_FoodMate } from "src/foodmates/entities/user_foodmates.entity";
import { Like } from "src/likes/entities/like.entity";

@Entity({ name: "users" })
@Unique(["email"])
@Unique(["phone"])
export class User {
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

    @OneToOne(() => Point, (point) => point.user, { cascade: true })
    point: Point;

    @OneToMany(() => Saved_Place, (savedPlace) => savedPlace.user, { cascade: true })
    savedPlaces: Saved_Place[];

    @OneToMany(() => User_Title, (userTitle) => userTitle.user, { cascade: true })
    userTitles: User_Title[];

    @OneToMany(() => Follow, (follow) => follow.user, { cascade: true })
    follows: Follow[];

    @OneToMany(() => Coupon, (coupon) => coupon.user, { cascade: true })
    coupons: Coupon[];

    @OneToMany(() => User_ChatRoom, (userChatRoom) => userChatRoom.user, { cascade: true })
    userChatRooms: User_ChatRoom[];

    @OneToMany(() => Message, (message) => message.user, { cascade: true })
    messages: Message[];

    @OneToMany(() => Reservation, (reservation) => reservation.user, { cascade: true })
    reservations: Reservation[];

    @OneToMany(() => Foodie, (foodie) => foodie.user, { cascade: true })
    foodies: Foodie[];

    @OneToMany(() => Foodie_Answer, (foodieAnswer) => foodieAnswer.user, { cascade: true })
    foodieAnswers: Foodie_Answer[];

    @OneToMany(() => FoodMate, (foodMate) => foodMate.user, { cascade: true })
    foodMates: FoodMate[];

    @OneToMany(() => User_FoodMate, (userFoodMate) => userFoodMate.user, { cascade: true })
    userFoodMates: User_FoodMate[];

    @OneToMany(() => Like, (like) => like.user, { cascade: true })
    likes: Like[];
}
