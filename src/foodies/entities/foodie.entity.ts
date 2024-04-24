import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { Status } from "../types/status.type";
import { Foodie_Answer } from "src/foodie_answers/entities/foodie_answer.entity";
import { User } from "src/users/entities/user.entity";
import { Level } from "src/titles/types/level.type";
import { FoodCategory } from "src/places/entities/foodCategorys.entity";

@Entity({ name: "foodies" })
export class Foodie {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false })
    userId: number;

    @Column({ type: 'int', nullable: false })
    foodCategoryId: number; 

    @Column({ type: 'enum', enum: Level, nullable: false })
    level: Level;

    @IsString()
    @Column({ type: 'varchar', nullable: false })
    title: string;

    @IsString()
    @Column({ type: 'text', nullable: false })
    content: string;

    @Column({ type: 'varchar', nullable: true })
    images: string;

    @IsNumber()
    @Column({ type: 'int', nullable: false, default: 0 })
    views: number;

    @IsEnum(Status)
    @Column({ type: 'enum', enum: Status, nullable: false, default: Status.BEFORE_ANSWER })
    status: Status;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => Foodie_Answer, (foodieAnswer) => foodieAnswer.foodie, { cascade: true })
    foodieAnswers: Foodie_Answer[];

    @ManyToOne(() => User, (user) => user.foodies)
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: User;

    @ManyToOne(() => FoodCategory, (foodCategory) => foodCategory.foodies)
    @JoinColumn({ name: 'foodCategoryId', referencedColumnName: 'id' })
    foodCategory: FoodCategory;
}
