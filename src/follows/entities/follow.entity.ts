import { User } from "src/users/entities/user.entity";
import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity({ name: 'follows'})
export class Follow {
    @PrimaryColumn()
    followerId: number;

    @PrimaryColumn()
    followeeId: number;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.follows, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'followerId', referencedColumnName: 'id'})
    @JoinColumn({ name: 'followeeId', referencedColumnName: 'id' })
    user: User;
}
