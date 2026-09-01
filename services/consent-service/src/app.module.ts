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
import { Titular } from './titulares/titular.entity';
import { Consentimiento } from './consentimientos/consentimiento.entity';
import { TitularesModule } from './titulares/titulares.module';
import { ConsentimientosModule } from './consentimientos/consentimientos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register(buildJwtModuleOptions()),
    TypeOrmModule.forRoot(buildTypeOrmOptions('consent', [Titular, Consentimiento])),
    HealthModule.forRoot('consent-service'),
    TitularesModule,
    ConsentimientosModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
