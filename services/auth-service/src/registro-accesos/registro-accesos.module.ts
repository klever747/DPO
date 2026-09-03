import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroAcceso } from './registro-acceso.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { RegistroAccesosService } from './registro-accesos.service';
import { RegistroAccesosController } from './registro-accesos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroAcceso, Usuario])],
  controllers: [RegistroAccesosController],
  providers: [RegistroAccesosService],
  exports: [RegistroAccesosService],
})
export class RegistroAccesosModule {}
