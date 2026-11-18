
import {
    Controller,
    Get,
  } from '@nestjs/common';
  
  import { PushService } from './push.service';
  
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
  }
  