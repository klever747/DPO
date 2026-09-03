import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { EstadoRiesgo } from '../evaluacion-riesgo.entity';

export class CreateEvaluacionDto {
  @IsUUID()
  empresaId: string;

  @IsOptional()
  @IsUUID()
  actividadId?: string;

  @IsString()
  @MaxLength(250)
  actividadNombre: string;

  @IsString()
  descripcionRiesgo: string;

  @IsInt()
  @Min(1)
  @Max(5)
  probabilidad: number;

  @IsInt()
  @Min(1)
  @Max(5)
  impacto: number;

  @IsOptional()
  @IsString()
  medidasMitigacion?: string;

  @IsOptional()
  @IsBoolean()
  requiereConsultaPrevia?: boolean;

  @IsOptional()
  @IsUUID()
  responsableId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  responsableNombre?: string;

  @IsOptional()
  @IsEmail()
  responsableEmail?: string;

  @IsOptional()
  @IsEnum(EstadoRiesgo)
  estado?: EstadoRiesgo;

  @IsOptional()
  @IsDateString()
  fechaEvaluacion?: string;

  @IsOptional()
  @IsDateString()
  fechaReevaluacion?: string;
}
