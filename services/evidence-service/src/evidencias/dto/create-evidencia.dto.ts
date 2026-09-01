import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TipoEvidencia } from '../evidencia.entity';

export class CreateEvidenciaDto {
  @IsUUID()
  empresaId: string;

  @IsString()
  moduloOrigen: string;

  @IsUUID()
  referenciaId: string;

  @IsOptional()
  @IsEnum(TipoEvidencia)
  tipoEvidencia?: TipoEvidencia;

  @IsString()
  nombreArchivo: string;

  @IsString()
  urlAlmacenamiento: string;

  @IsOptional()
  @IsString()
  hashIntegridad?: string;

  @IsOptional()
  @IsString()
  subidoPor?: string;
}
