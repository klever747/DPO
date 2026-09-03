import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, Min, ValidateNested } from 'class-validator';

class DominioDto {
  @IsString()
  dominio: string;

  @IsInt()
  @Min(1)
  @Max(5)
  nivel: number;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class CreateEvaluacionDto {
  @IsUUID()
  empresaId: string;

  @IsDateString()
  fechaEvaluacion: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsString()
  evaluador?: string;

  @IsOptional()
  @IsNumber()
  nivelGlobal?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DominioDto)
  dominios?: DominioDto[];
}
