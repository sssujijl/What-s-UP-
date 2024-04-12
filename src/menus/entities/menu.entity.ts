import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsDate, IsEnum, IsNumber, IsString } from "class-validator";
import { Place } from "src/places/entities/place.entity";
import { Order_Menus } from "src/reservations/entities/orderMenus.entity";

@Entity({ name: "menus" })
export class Menu {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false})
    placeId: number;

    @IsString()
    @Column({ type: 'varchar', nullable: false })
    name: string;

    @IsString()
    @Column({ type: 'varchar', nullable: true })
    description: string;

    @IsString()
    @Column({ type: 'varchar', length: 500, nullable: true })
    images: string;

    @IsNumber()
    @Column({ type: 'varchar', nullable: false })
    price: string;

    @OneToMany(() => Order_Menus, (orderMenu) => orderMenu.menu)
    orderMenus: Order_Menus[];

    @ManyToOne(() => Place, (place) => place.menus, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'placeId', referencedColumnName: 'id' })
    place: Place;
}
