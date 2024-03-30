import { CreateDateColumn, DeleteDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "user_titles" })
export class User_Titles {
    @PrimaryColumn({ type: 'int', nullable: false })
    userId: number;

    @PrimaryColumn({ type: 'int', nullable: false })
    titleId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
