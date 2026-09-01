import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser, JwtPayload, PaginationQueryDto, Roles } from '@dpo/common';
import { FormacionesService } from './formaciones.service';
import { CreateFormacionDto } from './dto/create-formacion.dto';
import { UpdateFormacionDto } from './dto/update-formacion.dto';

@Controller('formaciones')
export class FormacionesController {
  constructor(private readonly service: FormacionesService) {}

  @Roles('super_admin', 'admin_empresa', 'dpo', 'gestor')
  @Post()
  create(@Body() dto: CreateFormacionDto) {
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

  @Roles('super_admin', 'admin_empresa', 'dpo', 'gestor')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFormacionDto) {
    return this.service.update(id, dto);
  }

  @Roles('super_admin', 'admin_empresa', 'dpo')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
