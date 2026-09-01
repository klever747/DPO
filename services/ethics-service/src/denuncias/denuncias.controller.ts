import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser, JwtPayload, PaginationQueryDto, Public, Roles } from '@dpo/common';
import { DenunciasService } from './denuncias.service';
import { CreateDenunciaDto } from './dto/create-denuncia.dto';
import { UpdateDenunciaDto } from './dto/update-denuncia.dto';

@Controller('denuncias')
export class DenunciasController {
  constructor(private readonly service: DenunciasService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateDenunciaDto) {
    return this.service.create(dto);
  }

  @Public()
  @Get('seguimiento/:codigo')
  seguimiento(@Param('codigo') codigo: string) {
    return this.service.findByCodigo(codigo);
  }

  @Roles('super_admin', 'admin_empresa', 'dpo', 'auditor')
  @Get()
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() user: JwtPayload) {
    const empresaId = user.rol === 'super_admin' ? undefined : user.empresaId ?? undefined;
    return this.service.findAll(query, empresaId);
  }

  @Roles('super_admin', 'admin_empresa', 'dpo', 'auditor')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Roles('super_admin', 'admin_empresa', 'dpo')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDenunciaDto) {
    return this.service.update(id, dto);
  }

  @Roles('super_admin', 'admin_empresa', 'dpo')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
