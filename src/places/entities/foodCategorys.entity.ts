import { IsEnum, IsString } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Category } from '../types/category.type';
import { Title } from 'src/titles/entities/titles.entity';
import { FoodMate } from 'src/foodmates/entities/foodmate.entity';
import { Place } from './place.entity';
import { Foodie } from 'src/foodies/entities/foodie.entity';

@Entity({ name: 'foodCategorys' })
@Unique(['category'])
export class FoodCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @Column({ type: 'varchar', nullable: false })
  category: string;

  @OneToMany(() => Title, (title) => title.foodCategory)
  titles: Title[];

  @OneToMany(() => FoodMate, (foodMate) => foodMate.foodCategory)
  foodMates: FoodMate[];

  @OneToMany(() => Place, (place) => place.foodCategory)
  places: Place[];

  @OneToMany(() => Foodie, (foodie) => foodie.foodCategory)
  foodies: Foodie[];
}
