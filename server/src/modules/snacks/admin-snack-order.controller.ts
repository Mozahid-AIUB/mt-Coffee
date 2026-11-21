
import {
    Controller,
    Body,
    Param,
    ParseUUIDPipe,
    Patch,
    Get,
    UseGuards,
  } from '@nestjs/common';
  
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { RolesGuard } from '../auth/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  
  import { SnacksService } from './snacks.service';
  import { UpdateSnackOrderStatusDto } from './dto/update-snack-order-status.dto';
  
  @Controller('admin/snacks/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  export class AdminSnackOrdersController {
    constructor(private readonly snacksService: SnacksService) {}
  
    @Get()
    async getAllSnackOrders() {
      return this.snacksService.getAllSnackOrders();
    }

@Patch(':id/status')
async updateSnackOrderStatus(
  @Param('id', ParseUUIDPipe) orderId: string,
  @Body() updateStatusDto: UpdateSnackOrderStatusDto,
) {
  return this.snacksService.updateSnackOrderStatus(
    orderId,
    updateStatusDto,
  );
}

  }
