import { Controller, Get, Inject } from '@nestjs/common';
import { Public } from '../auth/jwt-auth.guard';

export const SERVICE_NAME = 'SERVICE_NAME';

@Controller('health')
export class HealthController {
  constructor(@Inject(SERVICE_NAME) private readonly serviceName: string) {}

  @Public()
  @Get()
  check() {
    return {
      status: 'ok',
      service: this.serviceName,
      timestamp: new Date().toISOString(),
    };
  }
}
