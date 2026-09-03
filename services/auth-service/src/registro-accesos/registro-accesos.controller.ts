import { Controller, Get } from '@nestjs/common';
import { CurrentUser, JwtPayload, RequireModule, Roles } from '@dpo/common';
import { RegistroAccesosService } from './registro-accesos.service';

@RequireModule('auditoria')
@Roles('super_admin', 'admin_empresa', 'dpo', 'auditor')
@Controller('registro-accesos')
export class RegistroAccesosController {
  constructor(private readonly service: RegistroAccesosService) {}

  @Get()
  listar(@CurrentUser() user: JwtPayload) {
    const empresaIds = user.rol === 'super_admin' ? undefined : user.empresaIds;
    return this.service.listar(empresaIds);
  }
}
