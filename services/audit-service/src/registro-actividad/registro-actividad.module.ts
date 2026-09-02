import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroActividad } from './registro-actividad.entity';
import { RegistroActividadService } from './registro-actividad.service';
import { RegistroActividadController } from './registro-actividad.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroActividad])],
  controllers: [RegistroActividadController],
  providers: [RegistroActividadService],
})
export class RegistroActividadModule {}
