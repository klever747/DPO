import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RequireModule, Roles } from '@dpo/common';
import { HallazgosService } from './hallazgos.service';
import { CreateHallazgoDto } from './dto/create-hallazgo.dto';
import { UpdateHallazgoDto } from './dto/update-hallazgo.dto';

@RequireModule('auditoria')
@Controller('auditorias/:auditoriaId/hallazgos')
export class HallazgosController {
  constructor(private readonly service: HallazgosService) {}

  @Roles('super_admin', 'admin_empresa', 'dpo', 'auditor')
  @Post()
  create(@Param('auditoriaId') auditoriaId: string, @Body() dto: CreateHallazgoDto) {
    return this.service.create(auditoriaId, dto);
  }

  @Get()
  findAll(@Param('auditoriaId') auditoriaId: string) {
    return this.service.findByAuditoria(auditoriaId);
  }

  @Roles('super_admin', 'admin_empresa', 'dpo', 'auditor')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateHallazgoDto) {
    return this.service.update(id, dto);
  }

  @Roles('super_admin', 'admin_empresa', 'dpo')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
