
import {
    IsNotEmpty,
    IsObject,
    IsString,
    IsUrl,
    ValidateNested,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  class PushSubscriptionKeysDto {
    @IsString()
    @IsNotEmpty()
    p256dh: string;
  
    @IsString()
    @IsNotEmpty()
    auth: string;
  }
  
  export class SavePushSubscriptionDto {
    @IsUrl({
      require_tld: false,
    })
    endpoint: string;
  
    @IsObject()
    @ValidateNested()
    @Type(() => PushSubscriptionKeysDto)
    keys: PushSubscriptionKeysDto;
  }
  