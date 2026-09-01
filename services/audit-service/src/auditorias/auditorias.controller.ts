import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser, JwtPayload, PaginationQueryDto, Roles } from '@dpo/common';
import { AuditoriasService } from './auditorias.service';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';

@Controller('auditorias')
export class AuditoriasController {
  constructor(private readonly service: AuditoriasService) {}

  @Roles('super_admin', 'admin_empresa', 'dpo', 'auditor')
  @Post()
  create(@Body() dto: CreateAuditoriaDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() user: JwtPayload) {
    const empresaId = user.rol === 'super_admin' ? undefined : user.empresaId ?? undefined;
    return this.service.findAll(query, empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Roles('super_admin', 'admin_empresa', 'dpo', 'auditor')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAuditoriaDto) {
    return this.service.update(id, dto);
  }

  @Roles('super_admin', 'admin_empresa', 'dpo')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
