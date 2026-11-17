
import {
    Controller,
    Get,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import { Request } from 'express';
  
  import { JwtAuthGuard } from './jwt-auth.guard';
  import { Roles } from './decorators/roles.decorator';
  import { RolesGuard } from './roles.guard';
  
  interface AuthenticatedRequest extends Request {
    user: {
      id: string;
      email: string;
      role: string;
    };
  }
  
  @Controller('auth')
  export class MeAuthController {
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('EMPLOYEE', 'ADMIN')
    @Get('me')
    getProfile(@Req() request: AuthenticatedRequest) {
      return {
        success: true,
        message: 'User information retrieved successfully.',
        data: {
          id: request.user.id,
          email: request.user.email,
          role: request.user.role,
        },
      };
    }
    
  }
  