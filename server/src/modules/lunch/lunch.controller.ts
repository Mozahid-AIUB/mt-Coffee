import {
    Body,
    Controller,
    Delete,
    Get,
    UseGuards,
    Param,
    Post,
    Req
  } from '@nestjs/common';

  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { RolesGuard } from '../auth/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';

  import type { Request } from 'express';

  import { CheckinDto } from './dto/checkin.dto';

  import { LunchService } from './lunch.service';

  interface AuthenticatedRequest extends Request {
    user: {
      id: string;
      email: string;
      role: string;
    };
  }

  @Controller('lunch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYEE', 'ADMIN')
  export class LunchController {
    constructor(private readonly lunchService: LunchService) {}

    @Get('week')
    async getNextLunchMenu() {
      return this.lunchService.getNextLunchMenu();
    }
    @Post('checkin')
    async checkIn(
      @Body() checkinDto: CheckinDto,
      @Req() request: AuthenticatedRequest,
    ) {
      return this.lunchService.checkIn(
        checkinDto,
        request.user.id,
      );
    }
    @Delete('checkin/:menuId')
async cancelCheckin(
  @Param('menuId') menuId: string,
  @Req() request: AuthenticatedRequest,
) {
  return this.lunchService.cancelCheckin(
    menuId,
    request.user.id,
  );
}
@Get('history')
async getLunchHistory(
  @Req() request: AuthenticatedRequest,
) {
  return this.lunchService.getLunchHistory(
    request.user.id,
  );
}
  }
