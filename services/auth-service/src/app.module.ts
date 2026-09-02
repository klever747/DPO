import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  HealthModule,
  JwtAuthGuard,
  ModulePermissionGuard,
  RolesGuard,
  buildJwtModuleOptions,
  buildTypeOrmOptions,
} from '@dpo/common';
import { Empresa } from './empresas/empresa.entity';
import { Usuario } from './usuarios/usuario.entity';
import { Sector } from './sectores/sector.entity';
import { RegistroAcceso } from './registro-accesos/registro-acceso.entity';
import { Departamento } from './departamentos/departamento.entity';
import { EmpresasModule } from './empresas/empresas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { SectoresModule } from './sectores/sectores.module';
import { RegistroAccesosModule } from './registro-accesos/registro-accesos.module';
import { DepartamentosModule } from './departamentos/departamentos.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register(buildJwtModuleOptions()),
    TypeOrmModule.forRoot(buildTypeOrmOptions('auth', [Empresa, Usuario, Sector, RegistroAcceso, Departamento])),
    HealthModule.forRoot('auth-service'),
    EmpresasModule,
    UsuariosModule,
    SectoresModule,
    RegistroAccesosModule,
    DepartamentosModule,
    AuthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ModulePermissionGuard },
  ],
})
export class AppModule {}
