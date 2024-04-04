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

    @ManyToOne(() => User, (user) => user.follower, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'followerId', referencedColumnName: 'id'})
    follower: User;

    @ManyToOne(() => User, (user) => user.followee, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'followeeId', referencedColumnName: 'id' })
    followee: User;
}
