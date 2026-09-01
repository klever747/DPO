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
import { Formacion } from './formaciones/formacion.entity';
import { Participante } from './participantes/participante.entity';
import { FormacionesModule } from './formaciones/formaciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register(buildJwtModuleOptions()),
    TypeOrmModule.forRoot(buildTypeOrmOptions('training', [Formacion, Participante])),
    HealthModule.forRoot('training-service'),
    FormacionesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
