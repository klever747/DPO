import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { CurrentUser, JwtPayload, RequireModule, Roles } from '@dpo/common';
import { RegistroActividadService } from './registro-actividad.service';
import { CreateRegistroActividadDto } from './dto/create-registro-actividad.dto';

@Controller('registro-actividad')
export class RegistroActividadController {
  constructor(private readonly service: RegistroActividadService) {}

  /**
   * Alimentado por el gateway (con el mismo Authorization del usuario) en
   * cada petición de escritura que proxea. Sin @RequireModule a propósito:
   * la actividad de CUALQUIER usuario autenticado debe poder registrarse,
   * no solo la de quienes tienen acceso al módulo de auditoría.
   */
  @HttpCode(204)
  @Post()
  registrar(@CurrentUser() user: JwtPayload, @Body() dto: CreateRegistroActividadDto) {
    return this.service.registrar(user, dto);
  }

  @RequireModule('auditoria')
  @Roles('super_admin', 'admin_empresa', 'dpo', 'auditor')
  @Get()
  listar(@CurrentUser() user: JwtPayload) {
    const empresaIds = user.rol === 'super_admin' ? undefined : user.empresaIds;
    return this.service.listar(empresaIds);
  }
}
