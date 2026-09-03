import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { EstadoParticipante } from '../participante.entity';

export class UpdateParticipanteDto {
  @IsOptional()
  @IsEnum(EstadoParticipante)
  estado?: EstadoParticipante;

  @IsOptional()
  @IsNumber()
  calificacion?: number;
}
