import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSectorDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nombre: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
