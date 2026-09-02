import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { CanalConsentimiento, EstadoDocumento, TipoArchivo } from '../consentimiento.entity';

export class CreateConsentimientoDto {
  @IsUUID()
  empresaId: string;

  @IsUUID()
  titularId: string;

  @IsString()
  finalidad: string;

  @IsOptional()
  @IsString()
  baseLegal?: string;

  @IsOptional()
  @IsEnum(CanalConsentimiento)
  canal?: CanalConsentimiento;

  @IsOptional()
  @IsEnum(EstadoDocumento)
  estadoDocumento?: EstadoDocumento;

  @IsOptional()
  @IsEnum(TipoArchivo)
  tipoArchivo?: TipoArchivo;

  @IsOptional()
  @IsString()
  versionTextoLegal?: string;

  @IsOptional()
  @IsString()
  ipOrigen?: string;

  @IsOptional()
  @IsString()
  evidenciaUrl?: string;
}
