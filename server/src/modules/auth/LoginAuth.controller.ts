
import {
    Body,
    Controller,
    Post,
    Req,
    Res,
    UnauthorizedException
  } from '@nestjs/common';
  import { Throttle } from '@nestjs/throttler';
  import type { Request } from 'express';
  import type { Response } from 'express';
  
  import { LoginAuthService } from './LoginAuth.service';
  import { LoginDto } from './dto/login.dto';
  
  @Controller('auth')
  export class LoginAuthController {
    constructor(
      private readonly loginAuthService: LoginAuthService,
    ) {}
    
    @Throttle({ default: { limit: 5, ttl: 60000 } })

    @Post('login')
    async login(
      @Body() loginDto: LoginDto,
      @Res({ passthrough: true }) response: Response,
    ) {
      // 1. Authenticate the employee and generate tokens.
      const result = await this.loginAuthService.login(loginDto);
  
      // 2. Separate the refresh token from the response data.
      const { refreshToken, ...responseData } = result.data;
  
      // 3. Store the refresh token in an HTTP-only cookie.
      response.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/auth',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
  
      // 4. Return the access token and employee information.
      return {
        ...result,
        data: responseData,
      };
    }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // 1. Read the refresh token from the HTTP-only cookie.
    const refreshToken = request.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing.');
    }

    // 2. Verify the token and generate replacement tokens.
    const result = await this.loginAuthService.refresh(refreshToken);

    // 3. Separate the new refresh token from the JSON response.
    const { refreshToken: newRefreshToken, ...responseData } = result.data;

    // 4. Update the HTTP-only cookie.
    response.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 5. Return only the new access token and employee information.
    return {
      ...result,
      data: responseData,
    };
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // 1. Read the refresh token from the cookie.
    const refreshToken = request.cookies?.refresh_token;

    // 2. Revoke the refresh token.
    const result = await this.loginAuthService.logout(refreshToken);

    // 3. Clear the refresh-token cookie.
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
    });

    // 4. Return the logout result.
    return result;
  }


  }
  