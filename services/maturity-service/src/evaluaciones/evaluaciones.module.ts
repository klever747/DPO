import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluacionMadurez } from './evaluacion-madurez.entity';
import { MadurezDominio } from './madurez-dominio.entity';
import { EvaluacionesService } from './evaluaciones.service';
import { EvaluacionesController } from './evaluaciones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EvaluacionMadurez, MadurezDominio])],
  controllers: [EvaluacionesController],
  providers: [EvaluacionesService],
  exports: [EvaluacionesService],
})
export class EvaluacionesModule {}
