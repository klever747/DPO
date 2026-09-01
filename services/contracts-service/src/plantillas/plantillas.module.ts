import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantillaContrato } from './plantilla-contrato.entity';
import { ContratoAsignado } from '../contratos/contrato-asignado.entity';
import { PlantillasService } from './plantillas.service';
import { PlantillasController } from './plantillas.controller';
import { ContratosService } from '../contratos/contratos.service';
import { ContratosController } from '../contratos/contratos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PlantillaContrato, ContratoAsignado])],
  controllers: [PlantillasController, ContratosController],
  providers: [PlantillasService, ContratosService],
  exports: [PlantillasService, ContratosService],
})
export class PlantillasModule {}
