import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsNumber, IsString } from "class-validator";
import { Menu } from "src/menus/entities/menu.entity";
import { PlaceList } from "src/place-lists/entities/place-list.entity";
import { Coupon } from "src/coupons/entities/coupon.entity";
import { Reservation } from "src/reservations/entities/reservation.entity";
import { Mission } from "src/missions/entities/mission.entity";
import { FoodCategory } from "./foodCategorys.entity";

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

    @OneToMany(() => Menu, (menu) => menu.place, { cascade: true })
    menus: Menu[];

    @OneToMany(() => PlaceList, (placeList) => placeList.place, { cascade: true })
    placeLists: PlaceList[];

    @OneToMany(() => Coupon, (coupon) => coupon.place, { cascade: true })
    coupons: Coupon[];

    @OneToMany(() => Mission, (mission) => mission.place, { cascade: true })
    missions: Mission[];

    @OneToMany(() => Reservation, (reservation) => reservation.place, { cascade: true })
    reservations: Reservation[];

    @ManyToOne(() => FoodCategory, (foodCategory) => foodCategory.places)
    @JoinColumn({ name: 'foodCategoryId', referencedColumnName: 'id' })
    foodCategory: FoodCategory;
}
