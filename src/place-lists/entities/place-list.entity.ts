import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Visible } from "../types/visible.type";
import { Saved_Place } from "./savedPlaces.entity";
import { Place } from "src/places/entities/place.entity";
import { User } from "src/users/entities/user.entity";

@Entity({ name: "placeLists" })
export class PlaceList {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false})
    userId: number;

    @IsString()
    @Column({ type: 'varchar', nullable: false })
    @IsNotEmpty({ message: '장소리스트 이름을 입력해주세요.'})
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

    @ManyToOne(() => User, (user) => user.placeLists, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: User;
}
