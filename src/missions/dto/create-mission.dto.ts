import { PickType } from "@nestjs/swagger";
import { Mission } from "../entities/mission.entity";

export class CreateMissionDto extends PickType(Mission, ['capacity', 'date', 'time']) {}
