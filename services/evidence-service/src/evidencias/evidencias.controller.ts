import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser, JwtPayload, PaginationQueryDto, RequireModule } from '@dpo/common';
import { EvidenciasService } from './evidencias.service';
import { CreateEvidenciaDto } from './dto/create-evidencia.dto';

@RequireModule('evidencias')
@Controller('evidencias')
export class EvidenciasController {
  constructor(private readonly service: EvidenciasService) {}

  @Post()
  create(@Body() dto: CreateEvidenciaDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() user: JwtPayload) {
    const empresaIds = user.rol === 'super_admin' ? undefined : user.empresaIds;
    return this.service.findAll(query, empresaIds);
  }

  @Get('referencia/:moduloOrigen/:referenciaId')
  findByReferencia(
    @Param('moduloOrigen') moduloOrigen: string,
    @Param('referenciaId') referenciaId: string,
  ) {
    return this.service.findByReferencia(moduloOrigen, referenciaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
