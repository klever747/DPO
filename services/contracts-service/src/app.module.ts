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
import { PlantillaContrato } from './plantillas/plantilla-contrato.entity';
import { ContratoAsignado } from './contratos/contrato-asignado.entity';
import { PlantillasModule } from './plantillas/plantillas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register(buildJwtModuleOptions()),
    TypeOrmModule.forRoot(buildTypeOrmOptions('contracts', [PlantillaContrato, ContratoAsignado])),
    HealthModule.forRoot('contracts-service'),
    PlantillasModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
