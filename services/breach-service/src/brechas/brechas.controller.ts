import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser, JwtPayload, PaginationQueryDto, Roles } from '@dpo/common';
import { BrechasService } from './brechas.service';
import { CreateBrechaDto } from './dto/create-brecha.dto';
import { UpdateBrechaDto } from './dto/update-brecha.dto';

@Controller('brechas')
export class BrechasController {
  constructor(private readonly service: BrechasService) {}

  @Roles('super_admin', 'admin_empresa', 'dpo', 'gestor')
  @Post()
  create(@Body() dto: CreateBrechaDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateBrechaDto) {
    return this.service.update(id, dto);
  }

  @Roles('super_admin', 'admin_empresa', 'dpo')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
