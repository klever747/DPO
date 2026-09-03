import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RequireModule, Roles } from '@dpo/common';
import { ParticipantesService } from './participantes.service';
import { CreateParticipanteDto } from './dto/create-participante.dto';
import { UpdateParticipanteDto } from './dto/update-participante.dto';

@RequireModule('formacion')
@Controller('formaciones/:formacionId/participantes')
export class ParticipantesController {
  constructor(private readonly service: ParticipantesService) {}

  @Roles('super_admin', 'admin_empresa', 'dpo', 'gestor', 'empleado')
  @Post()
  create(@Param('formacionId') formacionId: string, @Body() dto: CreateParticipanteDto) {
    return this.service.create(formacionId, dto);
  }

  @Get()
  findAll(@Param('formacionId') formacionId: string) {
    return this.service.findByFormacion(formacionId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateParticipanteDto) {
    return this.service.update(id, dto);
  }

  @Roles('super_admin', 'admin_empresa', 'dpo', 'gestor', 'empleado')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
