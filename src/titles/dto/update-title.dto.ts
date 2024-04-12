import { PickType } from '@nestjs/mapped-types';
import { Title } from '../entities/title.entity';

export class UpdateTitleDto extends PickType(Title,[
    'level',
    'foodCategoryId'
]){}
