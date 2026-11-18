import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
  } from '@nestjs/common';

  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { RolesGuard } from '../auth/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';

  import { SnacksService } from './snacks.service';
  import { CreateSnackItemDto } from './dto/create-sncak-item.dto';
  import { UpdateSnackItemDto } from './dto/update-snack-item.dto';

  @Controller('admin/snacks/items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  export class AdminSnacksController {
    constructor(private readonly snacksService: SnacksService) {}

    @Post()
    async createSnackItem(
      @Body() createSnackItemDto: CreateSnackItemDto,
    ) {
      return this.snacksService.createSnackItem(
        createSnackItemDto,
      );
    }

    @Get()
    async getAllSnackItems() {
      return this.snacksService.getAllSnackItems();
    }

    @Patch(':id')
    async updateSnackItem(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateSnackItemDto: UpdateSnackItemDto,
    ) {
      return this.snacksService.updateSnackItem(
        id,
        updateSnackItemDto,
      );
    }

    @Patch(':id/availability')
    async updateSnackItemAvailability(
      @Param('id', ParseUUIDPipe) id: string,
      @Body('isAvailable') isAvailable: boolean,
    ) {
      return this.snacksService.updateSnackItemAvailability(
        id,
        isAvailable,
      );
    }
  }
