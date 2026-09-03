import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TipoAuditoria } from '../auditoria.entity';

export class CreateAuditoriaDto {
  @IsUUID()
  empresaId: string;

  @IsOptional()
  @IsEnum(TipoAuditoria)
  tipo?: TipoAuditoria;

  @IsOptional()
  @IsString()
  alcance?: string;

  @IsOptional()
  @IsString()
  auditor?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}
