import { PickType } from "@nestjs/mapped-types";
import { Reservation } from "../entities/reservation.entity";
import { IsObject, ValidateNested } from "class-validator";

export class CreateReservationDto extends PickType (Reservation, [
    'userId',
    'capacity'
]) {
    @IsObject()
    @ValidateNested()
    orderMenus: Record<number, number>;
}
