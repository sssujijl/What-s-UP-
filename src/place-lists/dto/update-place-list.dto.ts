import { PickType } from "@nestjs/mapped-types";
import { PlaceList } from "../entities/place-list.entity";

export class UpdatePlaceListDto extends PickType(PlaceList, [
    'id',
    'title',
    'content',
    'visible'
]) {}