import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTitularDto {
  @IsUUID()
  empresaId: string;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  documentoIdentidad?: string;

  @IsOptional()
  @IsString()
  telefono?: string;
}
