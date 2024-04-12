import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Title } from "./title.entity";

@Entity({ name: "user_titles" })
export class User_Title {
    @PrimaryColumn({ type: 'int', nullable: false })
    userId: number;

    @PrimaryColumn({ type: 'int', nullable: false })
    titleId: number;

    @Column({ type: 'int', nullable: false, default: 1 })
    count: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @ManyToOne(() => User, (user) => user.userTitles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: User;

    @ManyToOne(() => Title, (title) => title.userTitles)
    @JoinColumn({ name: 'titleId', referencedColumnName: 'id' })
    title: Title;
}
