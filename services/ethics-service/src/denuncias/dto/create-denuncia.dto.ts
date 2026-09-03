import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { CategoriaDenuncia } from '../denuncia.entity';

export class CreateDenunciaDto {
  @IsUUID()
  empresaId: string;

  @IsEnum(CategoriaDenuncia)
  categoria: CategoriaDenuncia;

  @IsString()
  descripcion: string;

  @IsOptional()
  @IsBoolean()
  denuncianteAnonimo?: boolean;

  @IsOptional()
  @IsString()
  denuncianteContacto?: string;
}
