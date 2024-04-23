import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Gender } from "../types/gender.types";
import { IsBoolean, IsEmail, IsEnum, IsMobilePhone, IsString } from "class-validator";
import { Point } from "src/points/entities/point.entity";
import { Title } from "src/titles/entities/titles.entity";
import { Follow } from "src/follows/entities/follow.entity";
import { Coupon } from "src/coupons/entities/coupon.entity";
import { Message } from "src/messages/entities/message.entity";
import { Reservation } from "src/reservations/entities/reservation.entity";
import { Foodie } from "src/foodies/entities/foodie.entity";
import { Foodie_Answer } from "src/foodie_answers/entities/foodie_answer.entity";
import { FoodMate } from "src/foodmates/entities/foodmate.entity";
import { User_FoodMate } from "src/foodmates/entities/user_foodmates.entity";
import { PlaceList } from "src/place-lists/entities/place-list.entity";
import { Review } from "src/reviews/entities/review.entity";
import { User_ChatRoom } from "src/chat-rooms/entites/user-chatRoom.entity";

@Entity({ name: "users" })
@Unique(['email'])
@Unique(['phone'])
@Unique(['nickName'])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @IsEmail()
    @Column({ type: 'varchar', nullable: false })
    email: string;

    @Column({ type: 'boolean', default: false })
    isVerified: boolean

    @Column({ type: 'varchar', nullable: true })
    profileImage: string;

    @IsString()
    @Column({ type: 'varchar', nullable: false })
    name: string;

    @IsString()
    @Column({ type: 'varchar', select: false, nullable: false })
    password: string;

    @Column({ type: 'date', nullable: false })
    birth: Date;

    @IsEnum(Gender, { message: '올바른 성별을 선택하세요.' })
    @Column({ type: 'enum', enum: Gender, nullable: false })
    gender: Gender;

    @IsMobilePhone("ko-KR")
    @Column({ type: 'varchar', nullable: false })
    phone: string;

    @IsString()
    @Column({ type: 'varchar', nullable: false })
    nickName: string;

    @Column({ type: 'boolean', nullable: false, default: true })
    smsConsent: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamp' })
    deletedAt: Date;

    @OneToOne(() => Point, (point) => point.user, { cascade: true })
    point: Point;

    @OneToMany(() => Review, (review) => review.user)
    reviews: Review[];

    @OneToMany(() => PlaceList, (placeList) => placeList.user, { cascade: true })
    placeLists: PlaceList[];

    @OneToMany(() => Title, (title) => title.user, { cascade: true })
    titles: Title[];

    @OneToMany(() => Follow, (follow) => follow.follower, { cascade: true })
    follower: Follow[];

    @OneToMany(() => Follow, (follow) => follow.followee, { cascade: true })
    followee: Follow[];

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
}
