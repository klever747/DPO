import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { CreateUsuarioDto } from './create-usuario.dto';

export class UpdateUsuarioDto extends PartialType(OmitType(CreateUsuarioDto, ['password'] as const)) {
  /** Opcional: si se envía, se actualiza la contraseña. Si se omite, se conserva la actual. */
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
