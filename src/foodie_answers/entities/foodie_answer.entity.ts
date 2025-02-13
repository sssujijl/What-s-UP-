import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsDate, IsEnum, IsNumber, IsString } from "class-validator";
import { Status } from "../types/status.type";
import { User } from "src/users/entities/user.entity";
import { Foodie } from "src/foodies/entities/foodie.entity";

@Entity({ name: "foodie_answers" })
export class Foodie_Answer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false})
    foodieId: number;

    @Column({ type: 'int', nullable: false})
    userId: number;

    @IsString()
    @Column({ type: 'text', nullable: false })
    content: string;

    @Column({ type: 'varchar', nullable: true })
    images: string;

    @IsEnum(Status)
    @Column({ type: 'enum', enum: Status, nullable: false, default: Status.BEFORE_ADOPTION })
    status: Status;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @ManyToOne(() => User, (user) => user.foodieAnswers)
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: User;

    @ManyToOne(() => Foodie, (foodie) => foodie.foodieAnswers)
    @JoinColumn({ name: 'foodieId', referencedColumnName: 'id' })
    foodie: Foodie;
}
