import { Module } from '@nestjs/common';

import { LunchController } from './lunch.controller';
import { AdminLunchController } from './admin-lunch.controller';
import { LunchService } from './lunch.service';

import { PushModule } from '../push/push.module';

@Module({
  imports: [PushModule],
  controllers: [
    LunchController,
    AdminLunchController,
  ],
  providers: [LunchService],
})
export class LunchModule {}