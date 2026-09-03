import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { NivelRiesgo } from '../brecha-seguridad.entity';

export class CreateBrechaDto {
  @IsUUID()
  empresaId: string;

  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoriasDatosAfectados?: string[];

  @IsOptional()
  @IsInt()
  numAfectados?: number;

  @IsOptional()
  @IsEnum(NivelRiesgo)
  nivelRiesgo?: NivelRiesgo;

  @IsDateString()
  fechaDeteccion: string;
}
