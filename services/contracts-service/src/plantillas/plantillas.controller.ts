import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser, JwtPayload, PaginationQueryDto, RequireModule, Roles } from '@dpo/common';
import { PlantillasService } from './plantillas.service';
import { CreatePlantillaDto } from './dto/create-plantilla.dto';
import { UpdatePlantillaDto } from './dto/update-plantilla.dto';

@RequireModule('contratos')
@Controller('plantillas-contrato')
export class PlantillasController {
  constructor(private readonly service: PlantillasService) {}

  @Roles('super_admin', 'admin_empresa', 'dpo')
  @Post()
  create(@Body() dto: CreatePlantillaDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdatePlantillaDto) {
    return this.service.update(id, dto);
  }

  @Roles('super_admin', 'admin_empresa', 'dpo')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
