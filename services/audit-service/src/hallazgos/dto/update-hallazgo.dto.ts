import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateHallazgoDto } from './create-hallazgo.dto';
import { EstadoHallazgo } from '../hallazgo-auditoria.entity';

export class UpdateHallazgoDto extends PartialType(CreateHallazgoDto) {
  @IsOptional()
  @IsEnum(EstadoHallazgo)
  estado?: EstadoHallazgo;
}
