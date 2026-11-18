
import { IsUUID } from 'class-validator';

export class CheckinDto {
  @IsUUID()
  menuId: string;

  @IsUUID()
  dishId: string;
}
