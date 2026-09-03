import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateConsentimientoDto } from './create-consentimiento.dto';

export class UpdateConsentimientoDto extends PartialType(
  OmitType(CreateConsentimientoDto, ['empresaId', 'titularId'] as const),
) {}
