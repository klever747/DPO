import { Controller, Get } from '@nestjs/common';
import { buildServiceRoutes } from '../proxy/proxy.config';

@Controller('status')
export class StatusController {
  @Get()
  async check() {
    const routes = buildServiceRoutes();
    const uniqueTargets = [...new Map(routes.map((r) => [r.target, r.service])).entries()];

    const services = await Promise.all(
      uniqueTargets.map(async ([target, service]) => {
        try {
          const res = await fetch(`${target}/health`, { signal: AbortSignal.timeout(2000) });
          const body = (await res.json()) as Record<string, unknown>;
          return { service, target, reachable: res.ok, ...body };
        } catch (err) {
          return { service, target, reachable: false, error: (err as Error).message };
        }
      }),
    );

    return { gateway: 'ok', timestamp: new Date().toISOString(), services };
  }
}
