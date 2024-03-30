import { CreateDateColumn, DeleteDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "saved_Places" })
export class Saved_Places {
    @PrimaryColumn({ type: 'int', nullable: false })
    userId: number;

    @PrimaryColumn({ type: 'int', nullable: false })
    placeListId: number;
}
