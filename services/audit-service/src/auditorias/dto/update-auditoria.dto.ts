import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CreateAuditoriaDto } from './create-auditoria.dto';
import { EstadoAuditoria } from '../auditoria.entity';

export class UpdateAuditoriaDto extends PartialType(CreateAuditoriaDto) {
  @IsOptional()
  @IsEnum(EstadoAuditoria)
  estado?: EstadoAuditoria;

  @IsOptional()
  @IsString()
  resultadoGeneral?: string;
}
