
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import type { Request } from 'express';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { RolesGuard } from '../auth/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { LunchService } from './lunch.service';
  import { CreateMenuDto } from './dto/create-menu.dto';
  import { UpdateMenuDto } from './dto/update-menu.dto';
  interface AuthenticatedRequest extends Request {
    user: {
      id: string;
      email: string;
      role: string;
    };
  }

  @Controller('admin/lunch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  export class AdminLunchController {
    constructor(private readonly lunchService: LunchService) {}

    @Post('menu')
    async createMenu(
      @Body() createMenuDto: CreateMenuDto,
      @Req() request: AuthenticatedRequest,
    ) {
      return this.lunchService.createMenu(
        createMenuDto,
        request.user.id,
      );
    }
    @Patch('menu/:id')
    async updateMenu(
      @Param('id', ParseUUIDPipe) menuId: string,
      @Body() updateMenuDto: UpdateMenuDto,
    ) {
      return this.lunchService.updateMenu(menuId, updateMenuDto);
    }

    @Delete('menu/:id')
    async deleteMenu(
      @Param('id', ParseUUIDPipe) menuId: string,
    ) {
      return this.lunchService.deleteMenu(menuId);
    }

    @Get('report')
async getDailyLunchReport(
  @Query('date') date: string,
) {
  return this.lunchService.getDailyLunchReport(date);
}
  }
