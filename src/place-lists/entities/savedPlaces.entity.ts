import { User } from "src/users/entities/user.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { PlaceList } from "./place-list.entity";
import { Place } from "src/places/entities/place.entity";

@Entity({ name: "saved_Places" })
export class Saved_Place {
    @PrimaryColumn({ type: 'int', nullable: false })
    placeId: number;

    @PrimaryColumn({ type: 'int', nullable: false })
    placeListId: number;

    @ManyToOne(() => Place, (place) => place.savedPlaces, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'placeId', referencedColumnName: 'id' })
    place: Place;

    @ManyToOne(() => PlaceList, (placeList) => placeList.savedPlaces, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'placeListId', referencedColumnName: 'id' })
    placeList: PlaceList;
}
