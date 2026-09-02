import { MODULE_KEYS } from '@dpo/common';
import { IsArray, IsBoolean, IsEmail, IsEnum, IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { RolUsuario } from '../usuario.entity';

export class CreateUsuarioDto {
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  empresaIds?: string[];

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
  @IsArray()
  @IsIn(MODULE_KEYS, { each: true })
  modulosPermitidos?: string[];

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
