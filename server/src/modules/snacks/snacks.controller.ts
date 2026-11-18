
import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import type { Request } from 'express';

  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { RolesGuard } from '../auth/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';

  import { SnacksService } from './snacks.service';
  import { CreateOrderDto } from './dto/create-order.dto';

  interface AuthenticatedRequest extends Request {
    user: {
      id: string;
      email: string;
      role: string;
    };
  }

  @Controller('snacks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYEE', 'ADMIN')
  export class SnacksController {
    constructor(private readonly snacksService: SnacksService) {}

    @Get('items')
    async getAvailableSnackItems() {
      return this.snacksService.getAvailableSnackItems();
    }

    @Post('orders')
    async createSnackOrder(
        @Body() createOrderDto: CreateOrderDto,
        @Req() request: AuthenticatedRequest,
      ) {
        return this.snacksService.createSnackOrder(
          createOrderDto,
          request.user.id,
        );
      }

      @Get('orders/mine')
      async getMySnackOrders(
        @Req() request: AuthenticatedRequest,
      ) {
        return this.snacksService.getMySnackOrders(
          request.user.id,
        );
      }

@Patch('orders/:id/cancel')
async cancelMySnackOrder(
  @Param('id', ParseUUIDPipe) orderId: string,
  @Req() request: AuthenticatedRequest,
) {
  return this.snacksService.cancelMySnackOrder(
    orderId,
    request.user.id,
  );
}

    }
