import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateContratoDto } from './create-contrato.dto';
import { EstadoContrato } from '../contrato-asignado.entity';

export class UpdateContratoDto extends PartialType(CreateContratoDto) {
  @IsOptional()
  @IsEnum(EstadoContrato)
  estado?: EstadoContrato;
}
