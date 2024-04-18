import { PickType } from "@nestjs/mapped-types";
import { Reservation } from "../entities/reservation.entity";
import { IsNotEmpty, IsNumber, IsObject, ValidateNested } from "class-validator";

export class CreateReservationDto extends PickType (Reservation, [
    'userId',
    'capacity'
]) {
    /**
     * 인원수
     * @example '3'
     */
    @IsNotEmpty({ message: '방문 인원수를 입력해주세요.' })
    @IsNumber()
    readonly capacity: number;

    /**
     * 메뉴 선택
     * @example '{'1': 2, '3': 1}'
     */
    @IsObject()
    @ValidateNested()
    orderMenus: Record<number, number>;

    /**
     * 메뉴 미 선택 시 예약금
     * @example '500'
     */
    deposit?: number;
}
