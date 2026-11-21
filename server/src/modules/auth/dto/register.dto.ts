
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(60)
  @Matches(/^[\p{L} ]+$/u, {
    message: 'Full name must contain only letters and spaces.',
  })
  fullName: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'Employee ID can contain only letters, numbers, and hyphens.',
  })
  employeeId: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+?88)?01[3-9]\d{8}$/, {
    message: 'Please provide a valid Bangladeshi phone number.',
  })
  phone: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message:
      'Password must contain uppercase, lowercase, number, and special character.',
  })
  password: string;
}
