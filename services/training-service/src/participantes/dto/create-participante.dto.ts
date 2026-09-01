import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateParticipanteDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
