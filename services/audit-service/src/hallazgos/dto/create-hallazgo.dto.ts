import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { SeveridadHallazgo } from '../hallazgo-auditoria.entity';

export class CreateHallazgoDto {
  @IsString()
  descripcion: string;

  @IsOptional()
  @IsEnum(SeveridadHallazgo)
  severidad?: SeveridadHallazgo;

  @IsOptional()
  @IsString()
  recomendacion?: string;

  @IsOptional()
  @IsString()
  responsable?: string;

  @IsOptional()
  @IsDateString()
  fechaLimiteRemediacion?: string;
}
