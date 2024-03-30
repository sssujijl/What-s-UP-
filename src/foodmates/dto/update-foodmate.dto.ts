import { PartialType } from '@nestjs/mapped-types';
import { CreateFoodmateDto } from './create-foodmate.dto';

export class UpdateFoodmateDto extends PartialType(CreateFoodmateDto) {}
