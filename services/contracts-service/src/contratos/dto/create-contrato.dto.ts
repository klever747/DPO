import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateContratoDto {
  @IsUUID()
  plantillaId: string;

  @IsString()
  terceroNombre: string;

  @IsOptional()
  @IsString()
  terceroNif?: string;

  @IsOptional()
  @IsDateString()
  fechaFirma?: string;

  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;

  @IsOptional()
  @IsString()
  archivoUrl?: string;
}
