import { Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'user_foodMates'})
export class User_FoodMate {
    @PrimaryColumn()
    userId: number;

    @PrimaryColumn()
    foodMateId: number;
}