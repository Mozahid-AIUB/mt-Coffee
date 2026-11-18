
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException
  } from '@nestjs/common';

  import { PrismaService } from '../../database/prisma.service';
  import { CreateMenuDto } from './dto/create-menu.dto';
  import { CheckinDto } from './dto/checkin.dto';

  @Injectable()
  export class LunchService {
    constructor(private readonly prisma: PrismaService) {}

    async createMenu(
      createMenuDto: CreateMenuDto,
      adminId: string,
    ) {
      const { date, dishes } = createMenuDto;

      // Validate the date format and calendar date.
      const lunchDate = new Date(`${date}T00:00:00.000Z`);

      if (
        Number.isNaN(lunchDate.getTime()) ||
        lunchDate.toISOString().slice(0, 10) !== date
      ) {
        throw new BadRequestException('Invalid lunch date.');
      }

      // Only Sunday through Thursday are working days.
      const weekday = lunchDate.getUTCDay();

      if (weekday === 5 || weekday === 6) {
        throw new BadRequestException(
          'Lunch menus can only be created for Sunday through Thursday.',
        );
      }

      // Get today's date in Bangladesh time.
      const dhakaDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Dhaka',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());

      if (date < dhakaDate) {
        throw new BadRequestException(
          'Lunch menus cannot be created for past dates.',
        );
      }

      // Calculate 10:00 PM Bangladesh time on the previous day.
      const cutoffAt = new Date(
        new Date(`${date}T00:00:00.000+06:00`).getTime() -
          2 * 60 * 60 * 1000,
      );

      // Save the menu and dishes together.
      try {
        const menu = await this.prisma.lunchMenu.create({
          data: {
            date: lunchDate,
            cutoffAt,
            createdById: adminId,
            dishes: {
              create: dishes.map((dish) => ({
                name: dish.name.trim(),
                description: dish.description?.trim() || null,
              })),
            },
          },
          include: {
            dishes: true,
          },
        });

        return {
          success: true,
          message: 'Lunch menu created successfully.',
          data: menu,
        };
      } catch (error) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          error.code === 'P2002'
        ) {
          throw new ConflictException(
            'A lunch menu already exists for this date.',
          );
        }

        throw error;
      }
    }
    async getNextLunchMenu() {
        // Get today's date in Bangladesh time.
        const dhakaDate = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Dhaka',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date());

        // Find the next working day (Sunday through Thursday).
        const lunchDate = new Date(`${dhakaDate}T00:00:00.000Z`);

        do {
          lunchDate.setUTCDate(lunchDate.getUTCDate() + 1);
        } while (
          lunchDate.getUTCDay() === 5 ||
          lunchDate.getUTCDay() === 6
        );

        // Find the menu for that working day.
        const menu = await this.prisma.lunchMenu.findUnique({
          where: {
            date: lunchDate,
          },
          include: {
            dishes: {
              where: {
                isActive: true,
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        });

        if (!menu) {
          return {
            success: true,
            message: 'The next lunch menu has not been published yet.',
            data: null,
          };
        }

        return {
          success: true,
          message: 'Next lunch menu retrieved successfully.',
          data: menu,
        };
      }

  async checkIn(
    checkinDto: CheckinDto,
    userId: string,
  ) {
    const { menuId, dishId } = checkinDto;

    // Find the requested lunch menu.
    const menu = await this.prisma.lunchMenu.findUnique({
      where: {
        id: menuId,
      },
    });

    if (!menu) {
      throw new NotFoundException('Lunch menu not found.');
    }

    // Check whether the selection deadline has passed.
    if (new Date() >= menu.cutoffAt) {
      throw new BadRequestException(
        'The lunch selection deadline has passed.',
      );
    }

    // Verify that the selected dish belongs to this menu.
    const dish = await this.prisma.lunchDish.findFirst({
      where: {
        id: dishId,
        menuId,
        isActive: true,
      },
    });

    if (!dish) {
      throw new NotFoundException(
        'Selected dish not found or is unavailable.',
      );
    }

    // Create or update the employee's lunch selection.
    const checkin = await this.prisma.lunchCheckin.upsert({
      where: {
        userId_date: {
          userId,
          date: menu.date,
        },
      },
      create: {
        userId,
        menuId,
        date: menu.date,
        dishId,
        dishName: dish.name,
      },
      update: {
        menuId,
        dishId,
        dishName: dish.name,
        checkedInAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Lunch selection saved successfully.',
      data: checkin,
    };
  }
  async cancelCheckin(
    menuId: string,
    userId: string,
  ) {
    // Find the requested lunch menu.
    const menu = await this.prisma.lunchMenu.findUnique({
      where: {
        id: menuId,
      },
    });

    if (!menu) {
      throw new NotFoundException('Lunch menu not found.');
    }

    // Check whether the cancellation deadline has passed.
    if (new Date() >= menu.cutoffAt) {
      throw new BadRequestException(
        'The lunch cancellation deadline has passed.',
      );
    }

    // Find this employee's lunch selection for the menu date.
    const checkin = await this.prisma.lunchCheckin.findUnique({
      where: {
        userId_date: {
          userId,
          date: menu.date,
        },
      },
    });

    if (!checkin || checkin.menuId !== menuId) {
      throw new NotFoundException(
        'Your lunch selection was not found.',
      );
    }

    // Delete only this employee's lunch selection.
    await this.prisma.lunchCheckin.delete({
      where: {
        id: checkin.id,
      },
    });

    return {
      success: true,
      message: 'Lunch selection cancelled successfully.',
      data: null,
    };
  }
  async getLunchHistory(userId: string) {
    const checkins = await this.prisma.lunchCheckin.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: 'desc',
      },
      select: {
        id: true,
        date: true,
        dishName: true,
        checkedInAt: true,
        menu: {
          select: {
            id: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Lunch history retrieved successfully.',
      data: checkins,
    };
  }
  async getDailyLunchReport(date: string) {
    // Validate the date format and calendar date.
    const lunchDate = new Date(`${date}T00:00:00.000Z`);

    if (
      Number.isNaN(lunchDate.getTime()) ||
      lunchDate.toISOString().slice(0, 10) !== date
    ) {
      throw new BadRequestException('Invalid report date.');
    }

    // Retrieve all lunch selections for the requested date.
    const checkins = await this.prisma.lunchCheckin.findMany({
      where: {
        date: lunchDate,
      },
      include: {
        user: {
          select: {
            fullName: true,
            employeeId: true,
          },
        },
      },
      orderBy: {
        checkedInAt: 'asc',
      },
    });

    // Calculate dish-wise selection counts.
    const dishCounts = checkins.reduce(
      (counts, checkin) => {
        counts[checkin.dishName] =
          (counts[checkin.dishName] || 0) + 1;

        return counts;
      },
      {} as Record<string, number>,
    );

    return {
      success: true,
      message: 'Daily lunch report retrieved successfully.',
      data: {
        date,
        totalSelections: checkins.length,
        dishCounts,
        employees: checkins.map((checkin) => ({
          fullName: checkin.user.fullName,
          employeeId: checkin.user.employeeId,
          dishName: checkin.dishName,
          checkedInAt: checkin.checkedInAt,
        })),
      },
    };
  }
  }
