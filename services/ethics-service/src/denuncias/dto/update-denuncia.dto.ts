import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoDenuncia } from '../denuncia.entity';

export class UpdateDenunciaDto {
  @IsOptional()
  @IsEnum(EstadoDenuncia)
  estado?: EstadoDenuncia;

  @IsOptional()
  @IsString()
  resolucion?: string;
}
