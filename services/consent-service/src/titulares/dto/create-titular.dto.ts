import { ArrayMinSize, IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTitularDto {
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  empresaIds: string[];

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
