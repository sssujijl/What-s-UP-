import { FoodCategory } from "src/places/entities/foodCategorys.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Level } from "../types/level.type";

@Entity({ name: "titles" })
export class Title {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false })
    userId: number;

    @Column({ type: 'int', nullable: false })
    foodCategoryId: number;

    @Column({ type: 'int', nullable: false, default: 1 })
    count: number;

    @Column({ type: 'enum', enum: Level, default: Level.입문, nullable: false})
    level: Level

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @ManyToOne(() => User, (user) => user.titles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: User;

    @ManyToOne(() => FoodCategory, (foodCategory) => foodCategory.titles)
    @JoinColumn({ name: 'foodCategoryId', referencedColumnName: 'id' })
    foodCategory: FoodCategory;
}
