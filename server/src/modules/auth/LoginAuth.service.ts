
import {
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { JwtService, JwtSignOptions } from '@nestjs/jwt';
  import * as bcrypt from 'bcrypt';
  import { createHash } from 'crypto';
  
  import { PrismaService } from '../../database/prisma.service';
  import { LoginDto } from './dto/login.dto';
  
  @Injectable()
  export class LoginAuthService {
    constructor(
      private readonly prisma: PrismaService,
      private readonly jwtService: JwtService,
      private readonly configService: ConfigService,
    ) {}
  
    async login(loginDto: LoginDto) {
      const { email, password } = loginDto;
  
      // 1. Find the employee by email.
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
  
      if (!user) {
        throw new UnauthorizedException('Invalid email or password.');
      }
  
      // 2. Verify the password.
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password,
      );
  
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password.');
      }
  
      // 3. Check whether the account is active.
      if (!user.isActive) {
        throw new ForbiddenException(
          'Your account is inactive. Please contact the administrator.',
        );
      }
  
      // 4. Read JWT configuration.
      const accessSecret = this.configService.getOrThrow<string>(
        'JWT_ACCESS_SECRET',
      );
  
      const refreshSecret = this.configService.getOrThrow<string>(
        'JWT_REFRESH_SECRET',
      );
  
      const accessExpiresIn = this.configService.getOrThrow<string>(
        'JWT_ACCESS_EXPIRES_IN',
      );
  
      const refreshExpiresIn = this.configService.getOrThrow<string>(
        'JWT_REFRESH_EXPIRES_IN',
      );
  
      // 5. Generate the access token.
      const accessToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
        },
        {
          secret: accessSecret,
          expiresIn: accessExpiresIn as JwtSignOptions['expiresIn'],
        },
      );
  
      // 6. Generate the refresh token.
      const refreshToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
        },
        {
          secret: refreshSecret,
          expiresIn: refreshExpiresIn as JwtSignOptions['expiresIn'],
        },
      );
  
      // 7. Convert the refresh token into a SHA-256 hash.
      const tokenHash = createHash('sha256')
        .update(refreshToken)
        .digest('hex');
  
      // 8. Calculate refresh token expiration.
      const expiresAt = this.getExpirationDate(refreshExpiresIn);
  
      // 9. Store the hashed refresh token in PostgreSQL.
      await this.prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });
  
      // 10. Return authentication information.
      return {
        success: true,
        message: 'Login successful.',
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            fullName: user.fullName,
            employeeId: user.employeeId,
            email: user.email,
            role: user.role,
          },
        },
      };
    }
    
  async refresh(refreshToken: string) {
    // 1. Verify the refresh token.
    const refreshSecret = this.configService.getOrThrow<string>(
      'JWT_REFRESH_SECRET',
    );

    let payload: { sub: string };

    try {
      payload = await this.jwtService.verifyAsync<{ sub: string }>(
        refreshToken,
        { secret: refreshSecret },
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    // 2. Hash the refresh token to find its database record.
    const tokenHash = createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    // 3. Check whether the token is valid and has not been revoked.
    const now = new Date();

    if (
      !storedToken ||
      storedToken.userId !== payload.sub ||
      storedToken.revokedAt !== null ||
      storedToken.expiresAt <= now
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    // 4. Check whether the employee account is still active.
    const user = storedToken.user;

    if (!user.isActive) {
      throw new ForbiddenException(
        'Your account is inactive. Please contact the administrator.',
      );
    }

    // 5. Read the JWT configuration.
    const accessSecret = this.configService.getOrThrow<string>(
      'JWT_ACCESS_SECRET',
    );

    const accessExpiresIn = this.configService.getOrThrow<string>(
      'JWT_ACCESS_EXPIRES_IN',
    );

    const refreshExpiresIn = this.configService.getOrThrow<string>(
      'JWT_REFRESH_EXPIRES_IN',
    );

    // 6. Generate a new access token.
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      {
        secret: accessSecret,
        expiresIn: accessExpiresIn as JwtSignOptions['expiresIn'],
      },
    );

    // 7. Generate a new refresh token.
    const newRefreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn as JwtSignOptions['expiresIn'],
      },
    );

    // 8. Hash the new refresh token.
    const newTokenHash = createHash('sha256')
      .update(newRefreshToken)
      .digest('hex');

    const newExpiresAt = this.getExpirationDate(refreshExpiresIn);

    // 9. Revoke the old token and save the new one atomically.
    await this.prisma.$transaction(async (transaction) => {
      const revokedToken = await transaction.refreshToken.updateMany({
        where: {
          id: storedToken.id,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: {
          revokedAt: new Date(),
        },
      });

      if (revokedToken.count !== 1) {
        throw new UnauthorizedException(
          'Refresh token has already been used or revoked.',
        );
      }

      await transaction.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: newTokenHash,
          expiresAt: newExpiresAt,
        },
      });
    });

    // 10. Return the new tokens and safe employee information.
    return {
      success: true,
      message: 'Token refreshed successfully.',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          fullName: user.fullName,
          employeeId: user.employeeId,
          email: user.email,
          role: user.role,
        },
      },
    };
  }
    
  async logout(refreshToken?: string) {
    // 1. Check whether a refresh token was provided.
    if (refreshToken) {
      // 2. Hash the refresh token.
      const tokenHash = createHash('sha256')
        .update(refreshToken)
        .digest('hex');

      // 3. Revoke the token if it exists and has not already been revoked.
      await this.prisma.refreshToken.updateMany({
        where: {
          tokenHash,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }

    // 4. Return the logout result.
    return {
      success: true,
      message: 'Logout successful.',
      data: null,
    };
  }

    private getExpirationDate(duration: string): Date {
      const match = duration.match(/^(\d+)(s|m|h|d)$/);
  
      if (!match) {
        throw new InternalServerErrorException(
          'Invalid JWT refresh token expiration configuration.',
        );
      }
  
      const amount = Number(match[1]);
      const unit = match[2];
  
      const milliseconds: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
      };
  
      return new Date(Date.now() + amount * milliseconds[unit]);
    }
  }
  