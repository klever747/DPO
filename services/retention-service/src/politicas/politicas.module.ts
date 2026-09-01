import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoliticaRetencion } from './politica-retencion.entity';
import { PoliticasService } from './politicas.service';
import { PoliticasController } from './politicas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PoliticaRetencion])],
  controllers: [PoliticasController],
  providers: [PoliticasService],
  exports: [PoliticasService],
})
export class PoliticasModule {}
