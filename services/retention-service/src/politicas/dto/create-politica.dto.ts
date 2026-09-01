import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { AccionVencimiento, UnidadPlazo } from '../politica-retencion.entity';

export class CreatePoliticaDto {
  @IsUUID()
  empresaId: string;

  @IsString()
  categoriaDatos: string;

  @IsOptional()
  @IsString()
  baseLegalRetencion?: string;

  @IsInt()
  @Min(1)
  plazoValor: number;

  @IsOptional()
  @IsEnum(UnidadPlazo)
  plazoUnidad?: UnidadPlazo;

  @IsOptional()
  @IsString()
  criterioInicioComputo?: string;

  @IsOptional()
  @IsEnum(AccionVencimiento)
  accionAlVencer?: AccionVencimiento;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
