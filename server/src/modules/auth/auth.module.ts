import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './RegistrationAuth.service';
import { RegistrationAuthController } from './RegistrationAuth.controller';

import { LoginAuthService } from './LoginAuth.service';
import { LoginAuthController } from './LoginAuth.controller';
import { MeAuthController } from './MeAuth.controller';

import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    ConfigModule,

    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      }),
    }),
  ],
  controllers: [
    RegistrationAuthController,
    LoginAuthController,
    MeAuthController
  ],
  providers: [
    AuthService,
    LoginAuthService,
    JwtStrategy,
    RolesGuard
  ],
  exports: [AuthService, LoginAuthService],
})
export class AuthModule {}