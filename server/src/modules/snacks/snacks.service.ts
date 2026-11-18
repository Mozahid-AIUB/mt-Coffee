import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  
  import { PrismaService } from '../../database/prisma.service';
  
  import { CreateSnackItemDto } from './dto/create-sncak-item.dto';
  import { UpdateSnackItemDto } from './dto/update-snack-item.dto';
  import { CreateOrderDto } from './dto/create-order.dto';
  import { UpdateSnackOrderStatusDto } from './dto/update-snack-order-status.dto';
  @Injectable()
  export class SnacksService {
    constructor(private readonly prisma: PrismaService) {}
  
    async createSnackItem(dto: CreateSnackItemDto) {
      const name = dto.name.trim();
  
      const existingItem = await this.prisma.snackItem.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive',
          },
        },
      });
  
      if (existingItem) {
        throw new ConflictException('This snack item already exists.');
      }
  
      const snackItem = await this.prisma.snackItem.create({
        data: {
          name,
          ...(dto.options !== undefined && {
            options: dto.options,
          }),
        },
      });
  
      return {
        success: true,
        message: 'Snack item created successfully.',
        data: snackItem,
      };
    }
  
    async getAllSnackItems() {
      const snackItems = await this.prisma.snackItem.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
  
      return {
        success: true,
        message: 'Snack items retrieved successfully.',
        data: snackItems,
      };
    }

async getAllSnackOrders() {
    const orders = await this.prisma.snackOrder.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        userId: true,
        itemId: true,
        itemName: true,
        quantity: true,
        options: true,
        location: true,
        note: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            fullName: true,
            employeeId: true,
          },
        },
      },
    });
  
    return {
      success: true,
      message: 'All snack orders retrieved successfully.',
      data: orders,
    };
  }
  
async updateSnackOrderStatus(
    orderId: string,
    dto: UpdateSnackOrderStatusDto,
  ) {
    const order = await this.prisma.snackOrder.findUnique({
      where: {
        id: orderId,
      },
    });
  
    if (!order) {
      throw new NotFoundException('Snack order not found.');
    }
  
    const allowedTransitions: Record<string, string[]> = {
      PENDING: ['PREPARING', 'CANCELLED'],
      PREPARING: ['SERVED', 'CANCELLED'],
      SERVED: [],
      CANCELLED: [],
    };
  
    if (!allowedTransitions[order.status].includes(dto.status)) {
      throw new BadRequestException(
        `Cannot change order status from ${order.status} to ${dto.status}.`,
      );
    }
  
    const updatedOrder = await this.prisma.snackOrder.update({
      where: {
        id: orderId,
      },
      data: {
        status: dto.status,
      },
    });
  
    return {
      success: true,
      message: 'Snack order status updated successfully.',
      data: updatedOrder,
    };
  }
  
    async getAvailableSnackItems() {
        const snackItems = await this.prisma.snackItem.findMany({
          where: {
            isAvailable: true,
          },
          orderBy: {
            name: 'asc',
          },
        });
      
        return {
          success: true,
          message: 'Available snack items retrieved successfully.',
          data: snackItems,
        };
      }

async createSnackOrder(
    dto: CreateOrderDto,
    userId: string,
  ) {
    // Get the current time in Bangladesh.
    const timeParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date());
  
    const hour = Number(
      timeParts.find((part) => part.type === 'hour')?.value,
    );
  
    const minute = Number(
      timeParts.find((part) => part.type === 'minute')?.value,
    );
  
    const currentMinutes = hour * 60 + minute;
  
    // Orders are accepted from 8:00 AM through 8:00 PM.
    if (currentMinutes < 480 || currentMinutes > 1200) {
      throw new BadRequestException(
        'Snack orders are accepted only between 8:00 AM and 8:00 PM Bangladesh time.',
      );
    }
  
    // Check whether the requested snack item exists.
    const snackItem = await this.prisma.snackItem.findUnique({
      where: {
        id: dto.itemId,
      },
    });
  
    if (!snackItem) {
      throw new NotFoundException('Snack item not found.');
    }
  
    // Employees cannot order unavailable items.
    if (!snackItem.isAvailable) {
      throw new BadRequestException(
        'This snack item is currently unavailable.',
      );
    }
  
    // Create the order.
    const snackOrder = await this.prisma.snackOrder.create({
      data: {
        userId,
        itemId: snackItem.id,
        itemName: snackItem.name,
        quantity: dto.quantity,
        options: dto.options ?? undefined,
        location: dto.location.trim(),
        note: dto.note?.trim() || null,
      },
    });
  
    return {
      success: true,
      message: 'Snack order placed successfully.',
      data: snackOrder,
    };
  }
   
async getMySnackOrders(userId: string) {
    const orders = await this.prisma.snackOrder.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        itemId: true,
        itemName: true,
        quantity: true,
        options: true,
        location: true,
        note: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  
    return {
      success: true,
      message: 'Your snack orders retrieved successfully.',
      data: orders,
    };
  }
  
async cancelMySnackOrder(
    orderId: string,
    userId: string,
  ) {
    const order = await this.prisma.snackOrder.findFirst({
      where: {
        id: orderId,
        userId,
      },
    });
  
    if (!order) {
      throw new NotFoundException(
        'Snack order not found.',
      );
    }
  
    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending snack orders can be cancelled.',
      );
    }
  
    const cancelledOrder = await this.prisma.snackOrder.update({
      where: {
        id: orderId,
      },
      data: {
        status: 'CANCELLED',
      },
    });
  
    return {
      success: true,
      message: 'Snack order cancelled successfully.',
      data: cancelledOrder,
    };
  }
  
    async updateSnackItem(
      id: string,
      dto: UpdateSnackItemDto,
    ) {
      const existingItem = await this.prisma.snackItem.findUnique({
        where: { id },
      });
  
      if (!existingItem) {
        throw new NotFoundException('Snack item not found.');
      }
  
      const name = dto.name?.trim();
  
      if (name) {
        const duplicateItem = await this.prisma.snackItem.findFirst({
          where: {
            name: {
              equals: name,
              mode: 'insensitive',
            },
            NOT: {
              id,
            },
          },
        });
  
        if (duplicateItem) {
          throw new ConflictException(
            'Another snack item already uses this name.',
          );
        }
      }
  
      const updatedItem = await this.prisma.snackItem.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(dto.options !== undefined && {
            options: dto.options,
          }),
        },
      });
  
      return {
        success: true,
        message: 'Snack item updated successfully.',
        data: updatedItem,
      };
    }
  
    async updateSnackItemAvailability(
      id: string,
      isAvailable: boolean,
    ) {
      const existingItem = await this.prisma.snackItem.findUnique({
        where: { id },
      });
  
      if (!existingItem) {
        throw new NotFoundException('Snack item not found.');
      }
  
      const updatedItem = await this.prisma.snackItem.update({
        where: { id },
        data: { isAvailable },
      });
  
      return {
        success: true,
        message: isAvailable
          ? 'Snack item activated successfully.'
          : 'Snack item deactivated successfully.',
        data: updatedItem,
      };
    }
  }