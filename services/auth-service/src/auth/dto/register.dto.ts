import { IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class RegisterDto {
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
}
