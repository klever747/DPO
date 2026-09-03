import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AppModule } from './app.module';
import { buildServiceRoutes } from './proxy/proxy.config';
import { logActivity } from './proxy/activity-logger';

async function bootstrap() {
  // bodyParser se desactiva a propósito: el gateway es un proxy transparente
  // y no debe consumir el stream de la petición antes de reenviarlo — cada
  // microservicio destino hace su propio parseo del body.
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.enableCors();

  const routes = buildServiceRoutes();
  for (const route of routes) {
    app.use(
      route.prefix,
      createProxyMiddleware({
        target: route.target,
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
        onProxyRes: (proxyRes, req) => logActivity(req, proxyRes, route.service),
      }),
    );
  }

  const port = process.env.GATEWAY_PORT || 3000;
  await app.listen(port);
  console.log(`gateway-api escuchando en el puerto ${port} — ${routes.length} rutas registradas`);
}
bootstrap();
