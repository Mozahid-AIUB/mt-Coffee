import {
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    MaxLength,
  } from 'class-validator';
  
  import { Prisma } from '@prisma/client';
  
  export class CreateSnackItemDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    name: string;
  
    @IsOptional()
    @IsObject()
    options?: Prisma.InputJsonObject;
  }