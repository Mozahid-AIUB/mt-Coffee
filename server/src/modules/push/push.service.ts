
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import webPush from 'web-push';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PushService {
  private readonly publicKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const publicKey = this.configService.getOrThrow<string>(
      'VAPID_PUBLIC_KEY',
    );

    const privateKey = this.configService.getOrThrow<string>(
      'VAPID_PRIVATE_KEY',
    );

    const subject = this.configService.getOrThrow<string>(
      'VAPID_SUBJECT',
    );

    webPush.setVapidDetails(
      subject,
      publicKey,
      privateKey,
    );

    this.publicKey = publicKey;
  }

  getPublicKey(): string {
    return this.publicKey;
  }

async saveSubscription(
    userId: string,
    subscription: {
      endpoint: string;
      keys: {
        p256dh: string;
        auth: string;
      };
    },
  ) {
    const savedSubscription =
      await this.prisma.pushSubscription.upsert({
        where: {
          endpoint: subscription.endpoint,
        },
        create: {
          userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        update: {
          userId,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      });
  
    return {
      success: true,
      message: 'Push subscription saved successfully.',
      data: savedSubscription,
    };
  }
  
  async removeSubscription(
    userId: string,
    endpoint: string,
  ) {
    const result = await this.prisma.pushSubscription.deleteMany({
      where: {
        userId,
        endpoint,
      },
    });
  
    return {
      success: true,
      message: 'Push subscription removed successfully.',
      data: {
        deletedCount: result.count,
      },
    };
  }
  
}
