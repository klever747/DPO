import { IsBoolean, IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateRegistroActividadDto {
  @IsIn(['GET', 'POST', 'PATCH', 'PUT', 'DELETE'])
  metodo: string;

  @IsString()
  ruta: string;

  @IsString()
  servicio: string;

  @IsBoolean()
  exitoso: boolean;

  @IsOptional()
  @IsInt()
  statusCode?: number;
}
