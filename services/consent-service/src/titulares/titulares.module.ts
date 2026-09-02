import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Titular } from './titular.entity';
import { TitularEmpresa } from './titular-empresa.entity';
import { TitularesService } from './titulares.service';
import { TitularesController } from './titulares.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Titular, TitularEmpresa])],
  controllers: [TitularesController],
  providers: [TitularesService],
  exports: [TitularesService],
})
export class TitularesModule {}
