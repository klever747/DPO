import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Formacion } from './formacion.entity';
import { Participante } from '../participantes/participante.entity';
import { FormacionesService } from './formaciones.service';
import { FormacionesController } from './formaciones.controller';
import { ParticipantesService } from '../participantes/participantes.service';
import { ParticipantesController } from '../participantes/participantes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Formacion, Participante])],
  controllers: [FormacionesController, ParticipantesController],
  providers: [FormacionesService, ParticipantesService],
  exports: [FormacionesService],
})
export class FormacionesModule {}
