import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { IsEnum } from "class-validator";
import { level } from "../types/level.type";
import { User_Title } from "./user_titles.entity";
import { FoodCategory } from "src/places/entities/foodCategorys.entity";
import { Foodie } from "src/foodies/entities/foodie.entity";

@Entity({ name: "titles" })
@Unique(['level', 'foodCategoryId'])
export class Title {
    @PrimaryGeneratedColumn()
    id: number;

    @IsEnum(level)
    @Column({ type: 'enum', enum: level, nullable: false})
    level: level;

    @Column({ type: 'int', nullable: false })
    foodCategoryId: number;

    @ManyToOne(() => FoodCategory, (foodCategory) => foodCategory.titles)
    @JoinColumn({ name: 'foodCategoryId', referencedColumnName: 'id' })
    foodCategory: FoodCategory;

    @OneToMany(() => User_Title, (userTitle) => userTitle.title)
    userTitles: User_Title[];

    @OneToMany(() => Foodie, (foodie) => foodie.Title)
    foodies: Foodie[];
}
