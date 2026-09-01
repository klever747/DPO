import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { CanalConsentimiento } from '../consentimiento.entity';

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
  @IsString()
  versionTextoLegal?: string;

  @IsOptional()
  @IsString()
  ipOrigen?: string;

  @IsOptional()
  @IsString()
  evidenciaUrl?: string;
}
