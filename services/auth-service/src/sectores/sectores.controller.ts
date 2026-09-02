import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RequireModule, Roles } from '@dpo/common';
import { SectoresService } from './sectores.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';

@RequireModule('empresas-usuarios')
@Controller('sectores')
export class SectoresController {
  constructor(private readonly sectoresService: SectoresService) {}

  @Roles('super_admin', 'admin_empresa')
  @Post()
  create(@Body() dto: CreateSectorDto) {
    return this.sectoresService.create(dto);
  }

  @Get()
  findAll() {
    return this.sectoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sectoresService.findOne(id);
  }

  @Roles('super_admin', 'admin_empresa')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSectorDto) {
    return this.sectoresService.update(id, dto);
  }

  @Roles('super_admin', 'admin_empresa')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sectoresService.remove(id);
  }
}
