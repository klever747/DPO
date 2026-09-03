import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auditoria } from './auditoria.entity';
import { HallazgoAuditoria } from '../hallazgos/hallazgo-auditoria.entity';
import { AuditoriasService } from './auditorias.service';
import { AuditoriasController } from './auditorias.controller';
import { HallazgosService } from '../hallazgos/hallazgos.service';
import { HallazgosController } from '../hallazgos/hallazgos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Auditoria, HallazgoAuditoria])],
  controllers: [AuditoriasController, HallazgosController],
  providers: [AuditoriasService, HallazgosService],
  exports: [AuditoriasService],
})
export class AuditoriasModule {}
