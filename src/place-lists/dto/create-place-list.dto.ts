import { PickType } from "@nestjs/mapped-types";
import { PlaceList } from "../entities/place-list.entity";

export class CreatePlaceListDto extends PickType(PlaceList, [
    'userId',
    'title',
    'content',
    'visible'
]) {}
