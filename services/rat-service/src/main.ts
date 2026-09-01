import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = process.env.RAT_SERVICE_PORT || 3003;
  await app.listen(port);
  console.log(`rat-service escuchando en el puerto ${port}`);
}
bootstrap();
