import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsDate, IsEnum, IsNumber, IsString } from 'class-validator';
import { Gender } from '../types/gender.type';
import { Age } from '../types/age.type';
import { User } from 'src/users/entities/user.entity';
import { FoodCategory } from 'src/places/entities/foodCategorys.entity';
import { User_FoodMate } from './user_foodmates.entity';
import { Status } from '../types/status.type';

@Entity({ name: 'foodmates' })
export class FoodMate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  userId: number;

  @Column({ type: 'int', nullable: false })
  foodCategoryId: number;

  @IsString()
  @Column({ type: 'varchar', nullable: false })
  title: string;

  @IsString()
  @Column({ type: 'text', nullable: false })
  content: string;

  @IsString()
  @Column({ type: 'varchar', nullable: false })
  region: string;

  @IsString()
  @Column({ type: 'varchar', nullable: false })
  capacity: string;

  @IsNumber()
  @Column({ type: 'int', nullable: false, default: 0 })
  views: number;

  @IsEnum(Status)
  @Column({
    type: 'enum',
    enum: Status,
    nullable: false,
    default: Status.BEFORE_RECRUITMENT,
  })
  status: Status;

  @IsEnum(Gender)
  @Column({ type: 'enum', enum: Gender, nullable: false })
  gender: Gender;

  @IsString()
  @Column({ type: 'varchar', nullable: false })
  age: string;

  @IsDate()
  @Column({ type: 'datetime', nullable: false })
  dateTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => User_FoodMate, (userFoodMate) => userFoodMate.foodMate, {
    cascade: true,
  })
  userFoodMates: User_FoodMate[];

  @ManyToOne(() => User, (user) => user.foodMates)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => FoodCategory, (foodCategory) => foodCategory.foodMates)
  @JoinColumn({ name: 'foodCategoryId', referencedColumnName: 'id' })
  foodCategory: FoodCategory;
}
