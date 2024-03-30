import { PartialType } from '@nestjs/mapped-types';
import { CreateFoodieAnswerDto } from './create-foodie_answer.dto';

export class UpdateFoodieAnswerDto extends PartialType(CreateFoodieAnswerDto) {}
