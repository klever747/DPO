import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CreateSolicitudDto } from './create-solicitud.dto';
import { EstadoSolicitud } from '../solicitud-arco.entity';

export class UpdateSolicitudDto extends PartialType(CreateSolicitudDto) {
  @IsOptional()
  @IsEnum(EstadoSolicitud)
  estado?: EstadoSolicitud;

  @IsOptional()
  @IsString()
  respuesta?: string;
}
