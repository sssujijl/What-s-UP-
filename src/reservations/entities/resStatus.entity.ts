import { IsBoolean, IsEnum, IsNumber } from "class-validator";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Reservation } from "./reservation.entity";
import { Place } from "src/places/entities/place.entity";
import { Mission } from "src/missions/entities/mission.entity";
import { Order_Menus } from "./orderMenus.entity";

@Entity({ name: 'resStatus' })
export class ResStatus {
    @PrimaryGeneratedColumn()
    id: number;

    @IsNumber()
    @Column({ type: 'int', nullable: false })
    placeId: number;

    @Column({ type: 'int', nullable: true })
    missionId: number;

    @Column({ type: 'datetime', nullable: false })
    dateTime: Date;

    @IsBoolean()
    @Column({ type: 'boolean', nullable: false})
    status: boolean;

    @ManyToOne(() => Place, (place) => place.resStatus, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'placeId', referencedColumnName: 'id' })
    place: Place;

    @ManyToOne(() => Mission, (mission) => mission.resStatus)
    @JoinColumn({ name: 'missionId', referencedColumnName: 'id' })
    mission: Mission;

    @OneToOne(() => Reservation, (reservation) => reservation.resStatus)
    reservation: Reservation;
}