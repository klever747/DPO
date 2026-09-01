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
import { EvaluacionMadurez } from './evaluaciones/evaluacion-madurez.entity';
import { MadurezDominio } from './evaluaciones/madurez-dominio.entity';
import { EvaluacionesModule } from './evaluaciones/evaluaciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register(buildJwtModuleOptions()),
    TypeOrmModule.forRoot(buildTypeOrmOptions('maturity', [EvaluacionMadurez, MadurezDominio])),
    HealthModule.forRoot('maturity-service'),
    EvaluacionesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
