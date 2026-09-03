import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class RevisarTareaDto {
  @IsBoolean()
  aprobada: boolean;

  @IsOptional()
  @IsString()
  comentario?: string;
}
