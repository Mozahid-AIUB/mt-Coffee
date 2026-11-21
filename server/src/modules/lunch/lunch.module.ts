import { Module } from '@nestjs/common';

import { LunchController } from './lunch.controller';
import { AdminLunchController } from './admin-lunch.controller';
import { LunchService } from './lunch.service';

@Module({
  controllers: [
    LunchController,
    AdminLunchController,
  ],
  providers: [LunchService],
})
export class LunchModule {}