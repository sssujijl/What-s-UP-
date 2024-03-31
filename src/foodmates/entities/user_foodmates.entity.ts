import { User } from "src/users/entities/user.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { FoodMate } from "./foodmate.entity";

@Entity({ name: 'user_foodMates'})
export class User_FoodMate {
    @PrimaryColumn()
    userId: number;

    @PrimaryColumn()
    foodMateId: number;

    @ManyToOne(() => User, (user) => user.userFoodMates)
    @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
    user: User;

    @ManyToOne(() => FoodMate, (foodMate) => foodMate.userFoodMates)
    @JoinColumn({ name: 'foodMateId', referencedColumnName: 'id' })
    foodMate: FoodMate;
}