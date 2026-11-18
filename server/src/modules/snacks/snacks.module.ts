
import { Module } from '@nestjs/common';

import { AdminSnacksController } from './admin-snacks.controller';
import { SnacksController } from './snacks.controller';
import { SnacksService } from './snacks.service';
import { AdminSnackOrdersController } from './admin-snack-order.controller';
@Module({
  controllers: [
    AdminSnacksController,
    SnacksController,
    AdminSnackOrdersController,
  ],
  providers: [SnacksService],
})
export class SnacksModule {}
