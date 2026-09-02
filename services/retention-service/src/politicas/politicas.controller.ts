import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser, JwtPayload, PaginationQueryDto, RequireModule, Roles } from '@dpo/common';
import { PoliticasService } from './politicas.service';
import { CreatePoliticaDto } from './dto/create-politica.dto';
import { UpdatePoliticaDto } from './dto/update-politica.dto';

@RequireModule('retencion')
@Controller('politicas-retencion')
export class PoliticasController {
  constructor(private readonly service: PoliticasService) {}

  @Roles('super_admin', 'admin_empresa', 'dpo')
  @Post()
  create(@Body() dto: CreatePoliticaDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() user: JwtPayload) {
    const empresaIds = user.rol === 'super_admin' ? undefined : user.empresaIds;
    return this.service.findAll(query, empresaIds);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Roles('super_admin', 'admin_empresa', 'dpo')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePoliticaDto) {
    return this.service.update(id, dto);
  }

  @Roles('super_admin', 'admin_empresa', 'dpo')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
