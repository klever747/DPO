import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { TipoFormacion } from '../formacion.entity';

export class CreateFormacionDto {
  @IsUUID()
  empresaId: string;

  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(TipoFormacion)
  tipo?: TipoFormacion;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsNumber()
  duracionHoras?: number;

  @IsOptional()
  @IsBoolean()
  obligatoria?: boolean;
}
