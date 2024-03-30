import { PartialType } from '@nestjs/mapped-types';
import { CreateFoodieDto } from './create-foodie.dto';

export class UpdateFoodieDto extends PartialType(CreateFoodieDto) {}
