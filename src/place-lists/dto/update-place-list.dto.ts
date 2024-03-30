import { PartialType } from '@nestjs/mapped-types';
import { CreatePlaceListDto } from './create-place-list.dto';

export class UpdatePlaceListDto extends PartialType(CreatePlaceListDto) {}
