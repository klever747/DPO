import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { CreateBrechaDto } from './create-brecha.dto';
import { EstadoBrecha } from '../brecha-seguridad.entity';

export class UpdateBrechaDto extends PartialType(CreateBrechaDto) {
  @IsOptional()
  @IsEnum(EstadoBrecha)
  estado?: EstadoBrecha;

  @IsOptional()
  @IsString()
  medidasAdoptadas?: string;

  @IsOptional()
  @IsBoolean()
  notificadaAutoridad?: boolean;

  @IsOptional()
  @IsDateString()
  fechaNotificacionAutoridad?: string;

  @IsOptional()
  @IsBoolean()
  notificadaAfectados?: boolean;

  @IsOptional()
  @IsDateString()
  fechaNotificacionAfectados?: string;
}
