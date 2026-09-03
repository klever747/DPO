import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateTareaDto {
  @IsUUID()
  empresaId: string;

  @IsOptional()
  @IsUUID()
  departamentoId?: string;

  @IsOptional()
  @IsString()
  departamentoNombre?: string;

  @IsUUID()
  asignadoAId: string;

  @IsString()
  asignadoANombre: string;

  @IsOptional()
  @IsString()
  asignadoAEmail?: string;

  @IsString()
  @MaxLength(250)
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  baseLegal?: string;

  @IsDateString()
  fechaLimite: string;
}
