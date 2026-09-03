import { Controller, Get, Param, Patch } from '@nestjs/common';
import { CurrentUser, JwtPayload, RequireModule } from '@dpo/common';
import { NotificacionesService } from './notificaciones.service';

@RequireModule('tareas')
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly service: NotificacionesService) {}

  @Get()
  listar(@CurrentUser() user: JwtPayload) {
    return this.service.listarPropias(user.sub);
  }

  @Patch(':id/leida')
  marcarLeida(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.service.marcarLeida(id, user.sub);
  }
}
