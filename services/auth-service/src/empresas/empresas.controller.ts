import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PaginationQueryDto, Roles } from '@dpo/common';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Roles('super_admin')
  @Post()
  create(@Body() dto: CreateEmpresaDto) {
    return this.empresasService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.empresasService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.empresasService.findOne(id);
  }

  @Roles('super_admin', 'admin_empresa')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmpresaDto) {
    return this.empresasService.update(id, dto);
  }

  @Roles('super_admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empresasService.remove(id);
  }
}
