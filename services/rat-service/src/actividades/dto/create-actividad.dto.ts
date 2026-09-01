import { IsArray, IsBoolean, IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { EstadoActividad } from '../actividad-tratamiento.entity';

export class CreateActividadDto {
  @IsUUID()
  empresaId: string;

  @IsString()
  nombreActividad: string;

  @IsString()
  finalidad: string;

  @IsString()
  baseLegal: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoriasDatos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoriasTitulares?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  destinatarios?: string[];

  @IsOptional()
  @IsBoolean()
  transferenciasInternacionales?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  paisesDestino?: string[];

  @IsOptional()
  @IsString()
  garantiasTransferencia?: string;

  @IsOptional()
  @IsString()
  plazoConservacion?: string;

  @IsOptional()
  @IsString()
  medidasSeguridad?: string;

  @IsOptional()
  @IsString()
  responsableTratamiento?: string;

  @IsOptional()
  @IsString()
  encargadoTratamiento?: string;

  @IsOptional()
  @IsDateString()
  fechaEvaluacion?: string;

  @IsOptional()
  @IsEnum(EstadoActividad)
  estado?: EstadoActividad;
}
