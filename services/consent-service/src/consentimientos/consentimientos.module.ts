import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consentimiento } from './consentimiento.entity';
import { ConsentimientosService } from './consentimientos.service';
import { ConsentimientosController } from './consentimientos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Consentimiento])],
  controllers: [ConsentimientosController],
  providers: [ConsentimientosService],
  exports: [ConsentimientosService],
})
export class ConsentimientosModule {}
