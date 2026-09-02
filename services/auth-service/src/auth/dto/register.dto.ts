import { IsArray, IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class RegisterDto {
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
}
