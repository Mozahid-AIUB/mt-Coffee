import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './RegistrationAuth.service';
import { RegisterDto } from './dto/register.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class RegistrationAuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Throttle({ default: { limit: 3, ttl: 60000 } })

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}