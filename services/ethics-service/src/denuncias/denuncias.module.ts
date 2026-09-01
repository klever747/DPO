import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Denuncia } from './denuncia.entity';
import { DenunciasService } from './denuncias.service';
import { DenunciasController } from './denuncias.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Denuncia])],
  controllers: [DenunciasController],
  providers: [DenunciasService],
  exports: [DenunciasService],
})
export class DenunciasModule {}
