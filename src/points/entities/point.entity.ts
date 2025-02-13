import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsNumber } from "class-validator";
import { User } from "src/users/entities/user.entity";

@Entity({ name: "points" })
export class Point {
    @PrimaryColumn()
    userId: number;

    @IsNumber()
    @Column({ type: 'int', nullable: false })
    point: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToOne(() => User, (user) => user.point, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: User;
}
