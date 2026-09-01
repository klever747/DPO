import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudArco } from './solicitud-arco.entity';
import { SolicitudesService } from './solicitudes.service';
import { SolicitudesController } from './solicitudes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SolicitudArco])],
  controllers: [SolicitudesController],
  providers: [SolicitudesService],
  exports: [SolicitudesService],
})
export class SolicitudesModule {}
