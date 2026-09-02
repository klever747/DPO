import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser, JwtPayload, PaginationQueryDto, RequireModule } from '@dpo/common';
import { ConsentimientosService } from './consentimientos.service';
import { CreateConsentimientoDto } from './dto/create-consentimiento.dto';
import { UpdateConsentimientoDto } from './dto/update-consentimiento.dto';

@RequireModule('consentimientos')
@Controller('consentimientos')
export class ConsentimientosController {
  constructor(private readonly service: ConsentimientosService) {}

  @Post()
  create(@Body() dto: CreateConsentimientoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() user: JwtPayload) {
    const empresaIds = user.rol === 'super_admin' ? undefined : user.empresaIds;
    return this.service.findAll(query, empresaIds);
  }

  @Get('titular/:titularId')
  findByTitular(@Param('titularId') titularId: string) {
    return this.service.findByTitular(titularId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateConsentimientoDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/revocar')
  revocar(@Param('id') id: string) {
    return this.service.revocar(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
