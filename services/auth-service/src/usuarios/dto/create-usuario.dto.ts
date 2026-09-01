import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { RolUsuario } from '../usuario.entity';

export class CreateUsuarioDto {
  @IsOptional()
  @IsUUID()
  empresaId?: string;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  apellidos?: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEnum(RolUsuario)
  rol?: RolUsuario;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
