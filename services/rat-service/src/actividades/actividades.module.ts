import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActividadTratamiento } from './actividad-tratamiento.entity';
import { ActividadesService } from './actividades.service';
import { ActividadesController } from './actividades.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ActividadTratamiento])],
  controllers: [ActividadesController],
  providers: [ActividadesService],
  exports: [ActividadesService],
})
export class ActividadesModule {}
