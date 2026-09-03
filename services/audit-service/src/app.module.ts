import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  HealthModule,
  ModulePermissionGuard,
  JwtAuthGuard,
  RolesGuard,
  buildJwtModuleOptions,
  buildTypeOrmOptions,
} from '@dpo/common';
import { Auditoria } from './auditorias/auditoria.entity';
import { HallazgoAuditoria } from './hallazgos/hallazgo-auditoria.entity';
import { RegistroActividad } from './registro-actividad/registro-actividad.entity';
import { AuditoriasModule } from './auditorias/auditorias.module';
import { RegistroActividadModule } from './registro-actividad/registro-actividad.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register(buildJwtModuleOptions()),
    TypeOrmModule.forRoot(buildTypeOrmOptions('audit', [Auditoria, HallazgoAuditoria, RegistroActividad])),
    HealthModule.forRoot('audit-service'),
    AuditoriasModule,
    RegistroActividadModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ModulePermissionGuard },
  ],
})
export class AppModule {}
