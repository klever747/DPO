import { PartialType } from '@nestjs/mapped-types';
import { CreateTitularDto } from './create-titular.dto';

export class UpdateTitularDto extends PartialType(CreateTitularDto) {}
