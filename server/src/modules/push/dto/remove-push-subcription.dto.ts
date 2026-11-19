
import {
    IsNotEmpty,
    IsUrl,
  } from 'class-validator';
  
  export class RemovePushSubscriptionDto {
    @IsUrl()
    @IsNotEmpty()
    endpoint: string;
  }
  