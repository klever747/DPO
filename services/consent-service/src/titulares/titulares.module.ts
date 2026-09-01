import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Titular } from './titular.entity';
import { TitularesService } from './titulares.service';
import { TitularesController } from './titulares.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Titular])],
  controllers: [TitularesController],
  providers: [TitularesService],
  exports: [TitularesService],
})
export class TitularesModule {}
