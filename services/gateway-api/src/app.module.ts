import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from '@dpo/common';
import { StatusController } from './status/status.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HealthModule.forRoot('gateway-api')],
  controllers: [StatusController],
})
export class AppModule {}
