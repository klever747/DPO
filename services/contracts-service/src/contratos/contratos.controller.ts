import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PaginationQueryDto, RequireModule, Roles } from '@dpo/common';
import { ContratosService } from './contratos.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';

@RequireModule('contratos')
@Controller('contratos-asignados')
export class ContratosController {
  constructor(private readonly service: ContratosService) {}

  @Roles('super_admin', 'admin_empresa', 'dpo')
  @Post()
  create(@Body() dto: CreateContratoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Roles('super_admin', 'admin_empresa', 'dpo')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContratoDto) {
    return this.service.update(id, dto);
  }

  @Roles('super_admin', 'admin_empresa', 'dpo')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
