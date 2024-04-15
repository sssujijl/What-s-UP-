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
import { IsBoolean, IsString } from 'class-validator';
import { Menu } from 'src/menus/entities/menu.entity';
import { Coupon } from 'src/coupons/entities/coupon.entity';
import { FoodCategory } from './foodCategorys.entity';
import { ResStatus } from 'src/reservations/entities/resStatus.entity';
import { Saved_Place } from 'src/place-lists/entities/savedPlaces.entity';
import { Review } from 'src/reviews/entities/review.entity';

@Entity({ name: 'places' })
export class Place {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  foodCategoryId: number;

  @IsString()
  @Column({ type: 'varchar', nullable: false })
  title: string;

  @IsString()
  @Column({ type: 'varchar', length: 500, nullable: true })
  image: string;

  @IsString()
  @Column({ type: 'varchar', nullable: true })
  link: string;

  @IsString()
  @Column({ type: 'varchar', nullable: false })
  address: string;

  @IsString()
  @Column({ type: 'varchar', nullable: false })
  roadAddress: string;

  @IsBoolean()
  @Column({ type: 'boolean', nullable: false })
  hasMenu: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Menu, (menu) => menu.place, { cascade: true })
  menus: Menu[];

  @OneToMany(() => Saved_Place, (savedPlace) => savedPlace.place, {
    cascade: true,
  })
  savedPlaces: Saved_Place[];

  @OneToMany(() => Coupon, (coupon) => coupon.place, { cascade: true })
  coupons: Coupon[];

  @OneToMany(() => ResStatus, (resStatus) => resStatus.place, { cascade: true })
  resStatus: ResStatus[];

  @OneToMany(() => Review, (review) => review.place, { cascade: true })
  reviews: Review[];

  @ManyToOne(() => FoodCategory, (foodCategory) => foodCategory.places)
  @JoinColumn({ name: 'foodCategoryId', referencedColumnName: 'id' })
  foodCategory: FoodCategory;
}
