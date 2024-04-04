import { PickType } from "@nestjs/mapped-types";
import { Mission } from "../entities/mission.entity";

export class CreateMissionDto extends PickType(Mission, ['capacity', 'dateTime']) {}
