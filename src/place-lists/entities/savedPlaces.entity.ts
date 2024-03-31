import { User } from "src/users/entities/user.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { PlaceList } from "./place-list.entity";

@Entity({ name: "saved_Places" })
export class Saved_Place {
    @PrimaryColumn({ type: 'int', nullable: false })
    userId: number;

    @PrimaryColumn({ type: 'int', nullable: false })
    placeListId: number;

    @ManyToOne(() => User, (user) => user.savedPlaces, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: User;

    @ManyToOne(() => PlaceList, (placeList) => placeList.savedPlaces, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'placeListId', referencedColumnName: 'id' })
    placeList: PlaceList;
}
