import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TipoDerecho } from '../solicitud-arco.entity';

export class CreateSolicitudDto {
  @IsUUID()
  empresaId: string;

  @IsString()
  titularNombre: string;

  @IsOptional()
  @IsEmail()
  titularEmail?: string;

  @IsOptional()
  @IsString()
  titularDocumento?: string;

  @IsEnum(TipoDerecho)
  tipoDerecho: TipoDerecho;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  canalRecepcion?: string;
}
