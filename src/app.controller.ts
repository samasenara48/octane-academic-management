import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class AppController {
  @Get('health')
  getHealth() {
    return {
      company: 'Octane',
      project: 'Academic Management System',
      status: 'Running',
    };
  }
}