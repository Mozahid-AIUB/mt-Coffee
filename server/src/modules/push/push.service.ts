
import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import webPush from 'web-push';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PushService {
  private readonly publicKey: string;
  private readonly logger = new Logger(PushService.name);
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
  
async notifyAdmins(notification: {
  title: string;
  body: string;
  data?: Record<string, string>;
}) {
  const subscriptions =
    await this.prisma.pushSubscription.findMany({
      where: {
        user: {
          is: {
            role: UserRole.ADMIN,
            isActive: true,
          },
        },
      },
    });

  let sentCount = 0;
  let removedCount = 0;
  let failedCount = 0;

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify(notification),
        );

        sentCount++;
      } catch (error: unknown) {
        const statusCode = (
          error as { statusCode?: number }
        ).statusCode;

        if (statusCode === 404 || statusCode === 410) {
          await this.prisma.pushSubscription.deleteMany({
            where: {
              id: subscription.id,
            },
          });

          removedCount++;
        } else {
          failedCount++;

          this.logger.error(
            `Push notification failed for subscription ${subscription.id}.`,
          );
        }
      }
    }),
  );

  return {
    sentCount,
    removedCount,
    failedCount,
  };
}

}
