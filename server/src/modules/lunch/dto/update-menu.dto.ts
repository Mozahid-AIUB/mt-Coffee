import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  ValidateNested,
} from 'class-validator';

import { LunchDishDto } from './create-menu.dto';

export class UpdateMenuDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LunchDishDto)
  dishes: LunchDishDto[];
}
