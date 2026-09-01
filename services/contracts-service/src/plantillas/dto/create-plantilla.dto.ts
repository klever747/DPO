import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TipoPlantilla } from '../plantilla-contrato.entity';

export class CreatePlantillaDto {
  @IsUUID()
  empresaId: string;

  @IsString()
  nombre: string;

  @IsEnum(TipoPlantilla)
  tipo: TipoPlantilla;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  idioma?: string;

  @IsOptional()
  @IsString()
  contenidoUrl?: string;

  @IsOptional()
  @IsBoolean()
  vigente?: boolean;
}
