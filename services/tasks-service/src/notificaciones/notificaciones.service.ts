import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion } from './notificacion.entity';
import { Tarea } from '../tareas/tarea.entity';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly repo: Repository<Notificacion>,
  ) {}

  crear(tareaId: string, usuarioId: string, mensaje: string) {
    return this.repo.save(this.repo.create({ tareaId, usuarioId, mensaje }));
  }

  /** Mensaje de recordatorio según los días restantes (o de retraso) hasta la fecha límite. */
  crearRecordatorioTarea(tarea: Tarea) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const limite = new Date(tarea.fechaLimite);
    limite.setHours(0, 0, 0, 0);
    const dias = Math.round((limite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    let mensaje: string;
    if (dias > 0) {
      mensaje = `La tarea "${tarea.titulo}" aún no está concluida. Tienes ${dias} día(s) para realizarla.`;
    } else if (dias === 0) {
      mensaje = `La tarea "${tarea.titulo}" vence hoy y aún no está concluida.`;
    } else {
      mensaje = `La tarea "${tarea.titulo}" está vencida desde hace ${Math.abs(dias)} día(s). Por favor complétala cuanto antes.`;
    }
    return this.crear(tarea.id, tarea.asignadoAId, mensaje);
  }

  listarPropias(usuarioId: string) {
    return this.repo.find({ where: { usuarioId }, order: { createdAt: 'DESC' }, take: 100 });
  }

  async marcarLeida(id: string, usuarioId: string) {
    await this.repo.update({ id, usuarioId }, { leida: true });
  }
}
