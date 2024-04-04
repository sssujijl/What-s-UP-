import { IsEnum, IsString } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from '../types/category.type';
import { Title } from 'src/titles/entities/title.entity';
import { FoodMate } from 'src/foodmates/entities/foodmate.entity';
import { Place } from './place.entity';

@Entity({ name: 'foodCategorys' })
export class FoodCategory {
  @PrimaryGeneratedColumn()
  id: number;

  //   @IsEnum(Category)
  //   @Column({ type: 'enum', enum: Category })
  //   category: Category;

  @IsString()
  @Column({ type: 'varchar', nullable: false })
  category: string;

  @OneToMany(() => Title, (title) => title.foodCategory)
  titles: Title[];

  @OneToMany(() => FoodMate, (foodMate) => foodMate.foodCategory)
  foodMates: FoodMate[];

  @OneToMany(() => Place, (place) => place.foodCategory)
  places: Place[];
}
