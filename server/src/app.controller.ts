import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      success: true,
      message: 'Manush Tech Lunch & Snacks Backend is running.',
    };
  }
}