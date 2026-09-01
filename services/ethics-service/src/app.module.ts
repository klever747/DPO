import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  HealthModule,
  JwtAuthGuard,
  RolesGuard,
  buildJwtModuleOptions,
  buildTypeOrmOptions,
} from '@dpo/common';
import { Denuncia } from './denuncias/denuncia.entity';
import { DenunciasModule } from './denuncias/denuncias.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register(buildJwtModuleOptions()),
    TypeOrmModule.forRoot(buildTypeOrmOptions('ethics', [Denuncia])),
    HealthModule.forRoot('ethics-service'),
    DenunciasModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
