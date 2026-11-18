import {
  IsEnum,
} from 'class-validator';

import { SnackOrderStatus } from '@prisma/client';

export class UpdateSnackOrderStatusDto {
  @IsEnum(SnackOrderStatus)
  status: SnackOrderStatus;
}
