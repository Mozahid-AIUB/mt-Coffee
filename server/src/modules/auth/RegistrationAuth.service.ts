
import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import * as bcrypt from 'bcrypt';
  
  import { PrismaService } from '../../database/prisma.service';
  import { RegisterDto } from './dto/register.dto';
  
  @Injectable()
  export class AuthService {
    constructor(
      private readonly prisma: PrismaService,
      private readonly configService: ConfigService,
    ) {}
  
    async register(registerDto: RegisterDto) {
      const {
        fullName,
        employeeId,
        phone,
        email,
        password,
      } = registerDto;
  
      // 1. Get the permitted company email domain.
      const companyDomain = this.configService
        .get<string>('COMPANY_EMAIL_DOMAIN')
        ?.trim()
        .toLowerCase();
  
      if (!companyDomain) {
        throw new InternalServerErrorException(
          'Company email domain is not configured.',
        );
      }
  
      // 2. Check whether the email belongs to the company.
      if (!email.endsWith(`@${companyDomain}`)) {
        throw new ConflictException(
          `Please use your company email address (@${companyDomain}).`,
        );
      }
  
      // 3. Check whether the email, employee ID, or phone already exists.
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { employeeId },
            { phone },
          ],
        },
        select: {
          email: true,
          employeeId: true,
          phone: true,
        },
      });
  
      if (existingUser) {
        const conflicts: string[] = [];
  
        if (existingUser.email === email) {
          conflicts.push('Email');
        }
  
        if (existingUser.employeeId === employeeId) {
          conflicts.push('Employee ID');
        }
  
        if (existingUser.phone === phone) {
          conflicts.push('Phone number');
        }
  
        throw new ConflictException(
          `${conflicts.join(', ')} already registered.`,
        );
      }
  
      // 4. Hash the password before saving it.
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // 5. Create the employee account.
      const user = await this.prisma.user.create({
        data: {
          fullName,
          employeeId,
          phone,
          email,
          password: hashedPassword,
        },
        select: {
          id: true,
          fullName: true,
          employeeId: true,
          phone: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });
  
      // 6. Return safe user information.
      return {
        success: true,
        message: 'Registration successful.',
        data: user,
      };
    }
  }
  