import {
    IsInt,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    MaxLength,
    Min,
  } from 'class-validator';

  import { Prisma } from '@prisma/client';

  export class CreateOrderDto {
    @IsUUID()
    itemId: string;

    @IsInt()
    @Min(1)
    @Max(5)
    quantity: number;

    @IsOptional()
    @IsObject()
    options?: Prisma.InputJsonObject;

    @IsString()
    @IsNotEmpty()
    @MaxLength(60)
    location: string;

    @IsOptional()
    @IsString()
    @MaxLength(150)
    note?: string;
  }
