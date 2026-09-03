import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser, JwtPayload, RequireModule, Roles } from '@dpo/common';
import { DepartamentosService } from './departamentos.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';

@RequireModule('empresas-usuarios')
@Controller('departamentos')
export class DepartamentosController {
  constructor(private readonly service: DepartamentosService) {}

  @Roles('super_admin', 'admin_empresa')
  @Post()
  create(@Body() dto: CreateDepartamentoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    const empresaIds = user.rol === 'super_admin' ? undefined : user.empresaIds;
    return this.service.findAll(empresaIds);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Roles('super_admin', 'admin_empresa')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDepartamentoDto) {
    return this.service.update(id, dto);
  }

  @Roles('super_admin', 'admin_empresa')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
