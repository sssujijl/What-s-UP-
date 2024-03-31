import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsEnum, IsString } from "class-validator";
import { Visible } from "../types/visible.type";
import { Saved_Place } from "./savedPlaces.entity";
import { Place } from "src/places/entities/place.entity";

@Entity({ name: "placeLists" })
export class PlaceList {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false})
    placeId: number;

    @IsString()
    @Column({ type: 'varchar', nullable: false })
    title: string;

    @IsString()
    @Column({ type: 'varchar', nullable: true })
    content: string;

    @IsEnum(Visible, { message: '올바른 공개범위를 선택해주세요.' })
    @Column({ type: 'enum', enum: Visible, nullable: false })
    visible: Visible;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => Saved_Place, (savedPlace) => savedPlace.placeList, { cascade: true })
    savedPlaces: Saved_Place[];

    @ManyToOne(() => Place, (place) => place.placeLists, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'placeId', referencedColumnName: 'id' })
    place: Place;
}
