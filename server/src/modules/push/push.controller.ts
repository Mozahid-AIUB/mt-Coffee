
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { PushService } from './push.service';
import { SavePushSubscriptionDto } from './dto/save-push-subscription.dto';
import { RemovePushSubscriptionDto } from './dto/remove-push-subcription.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('push')
export class PushController {
  constructor(
    private readonly pushService: PushService,
  ) {}

  @Get('public-key')
  getPublicKey() {
    return {
      success: true,
      message: 'Push notification public key retrieved successfully.',
      data: {
        publicKey: this.pushService.getPublicKey(),
      },
    };
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EMPLOYEE')
  async saveSubscription(
    @Body() subscriptionDto: SavePushSubscriptionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.pushService.saveSubscription(
      request.user.id,
      subscriptionDto,
    );
  }

  @Delete('subscribe')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EMPLOYEE')
  async removeSubscription(
    @Body() subscriptionDto: RemovePushSubscriptionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.pushService.removeSubscription(
      request.user.id,
      subscriptionDto.endpoint,
    );
  }
}
