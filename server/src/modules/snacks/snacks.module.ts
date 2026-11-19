
import { Module } from '@nestjs/common';

import { AdminSnacksController } from './admin-snacks.controller';
import { SnacksController } from './snacks.controller';
import { AdminSnackOrdersController } from './admin-snack-order.controller';
import { SnacksService } from './snacks.service';

import { PushModule } from '../push/push.module';

@Module({
  imports: [PushModule],
  controllers: [
    AdminSnacksController,
    SnacksController,
    AdminSnackOrdersController,
  ],
  providers: [SnacksService],
})
export class SnacksModule {}
