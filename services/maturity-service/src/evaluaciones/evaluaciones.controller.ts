import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser, JwtPayload, PaginationQueryDto, Roles } from '@dpo/common';
import { EvaluacionesService } from './evaluaciones.service';
import { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluacion.dto';

@Controller('evaluaciones-madurez')
export class EvaluacionesController {
  constructor(private readonly service: EvaluacionesService) {}

  @Roles('super_admin', 'admin_empresa', 'dpo', 'auditor')
  @Post()
  create(@Body() dto: CreateEvaluacionDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateEvaluacionDto) {
    return this.service.update(id, dto);
  }

  @Roles('super_admin', 'admin_empresa', 'dpo')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
