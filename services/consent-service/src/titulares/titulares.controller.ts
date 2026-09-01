import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser, JwtPayload, PaginationQueryDto } from '@dpo/common';
import { TitularesService } from './titulares.service';
import { CreateTitularDto } from './dto/create-titular.dto';
import { UpdateTitularDto } from './dto/update-titular.dto';

@Controller('titulares')
export class TitularesController {
  constructor(private readonly service: TitularesService) {}

  @Post()
  create(@Body() dto: CreateTitularDto) {
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTitularDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
