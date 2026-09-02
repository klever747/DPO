import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateDepartamentoDto {
  @IsUUID()
  empresaId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nombre: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
