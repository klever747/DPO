import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser, JwtPayload, PaginationQueryDto } from '@dpo/common';
import { EvidenciasService } from './evidencias.service';
import { CreateEvidenciaDto } from './dto/create-evidencia.dto';

@Controller('evidencias')
export class EvidenciasController {
  constructor(private readonly service: EvidenciasService) {}

  @Post()
  create(@Body() dto: CreateEvidenciaDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() user: JwtPayload) {
    const empresaId = user.rol === 'super_admin' ? undefined : user.empresaId ?? undefined;
    return this.service.findAll(query, empresaId);
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
