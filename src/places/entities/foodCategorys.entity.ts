import { IsEnum } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "../types/category.type";

@Entity({ name: 'foodCategorys'})
export class FoodCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @IsEnum(Category)
    @Column({ type: 'enum', enum: Category})
    category: Category
}