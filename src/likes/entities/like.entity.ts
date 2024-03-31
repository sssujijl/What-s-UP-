import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { Place } from "src/places/entities/place.entity";
import { Foodie } from "src/foodies/entities/foodie.entity";

@Entity({ name: "likes" })
export class Like {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false })
    userId: number;

    @Column({ type: 'int', nullable: true })
    placeId: number;

    @Column({ type: 'int', nullable: true })
    foodieId: number;

    @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: User;

    @ManyToOne(() => Place, (place) => place.Likes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'placeId', referencedColumnName: 'id' })
    place: Place;

    @ManyToOne(() => Foodie, (foodie) => foodie.Likes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'foodieId', referencedColumnName: 'id' })
    foodie: Foodie;
}
