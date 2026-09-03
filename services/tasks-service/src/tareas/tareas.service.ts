import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginationQueryDto } from '@dpo/common';
import { EstadoTarea, Tarea } from './tarea.entity';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { RevisarTareaDto } from './dto/revisar-tarea.dto';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

const ROLES_REVISORES = new Set(['super_admin', 'admin_empresa', 'dpo', 'auditor']);

@Injectable()
export class TareasService {
  constructor(
    @InjectRepository(Tarea)
    private readonly repo: Repository<Tarea>,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  create(dto: CreateTareaDto, creadoPorEmail?: string) {
    return this.repo.save(this.repo.create({ ...dto, creadoPorEmail }));
  }

  /**
   * Los revisores (DPO/admin/super_admin/auditor) ven todas las tareas de su
   * alcance; el resto de roles (el jefe de área asignado) solo ve las suyas.
   */
  async findAll(query: PaginationQueryDto, empresaIds: string[] | undefined, usuarioId: string, rol: string) {
    if (empresaIds && empresaIds.length === 0) {
      return { data: [], total: 0, page: query.page, limit: query.limit };
    }
    const where: Record<string, unknown> = {};
    if (empresaIds) where.empresaId = In(empresaIds);
    if (!ROLES_REVISORES.has(rol)) where.asignadoAId = usuarioId;

    const [data, total] = await this.repo.findAndCount({
      where,
      skip: query.skip,
      take: query.limit,
      order: { fechaLimite: 'ASC' },
    });
    return { data, total, page: query.page, limit: query.limit };
  }

  async findOne(id: string): Promise<Tarea> {
    const tarea = await this.repo.findOne({ where: { id } });
    if (!tarea) throw new NotFoundException('Tarea no encontrada');
    return tarea;
  }

  async update(id: string, dto: UpdateTareaDto): Promise<Tarea> {
    const tarea = await this.findOne(id);
    Object.assign(tarea, dto);
    return this.repo.save(tarea);
  }

  async remove(id: string): Promise<void> {
    const tarea = await this.findOne(id);
    await this.repo.remove(tarea);
  }

  async adjuntarEvidencia(id: string, evidenciaUrl: string): Promise<Tarea> {
    const tarea = await this.findOne(id);
    tarea.evidenciaUrl = evidenciaUrl;
    tarea.estado = EstadoTarea.EN_REVISION;
    tarea.fechaCompletada = new Date();
    // Una nueva evidencia limpia la revisión anterior (p. ej. tras un rechazo).
    tarea.revisadoPorEmail = undefined;
    tarea.comentarioRevision = undefined;
    tarea.fechaRevision = undefined;
    return this.repo.save(tarea);
  }

  async revisar(id: string, dto: RevisarTareaDto, revisadoPorEmail: string): Promise<Tarea> {
    const tarea = await this.findOne(id);
    if (!tarea.evidenciaUrl) {
      throw new BadRequestException('La tarea todavía no tiene evidencia para revisar');
    }
    tarea.estado = dto.aprobada ? EstadoTarea.COMPLETADA : EstadoTarea.RECHAZADA;
    tarea.comentarioRevision = dto.comentario;
    tarea.revisadoPorEmail = revisadoPorEmail;
    tarea.fechaRevision = new Date();
    return this.repo.save(tarea);
  }

  async enviarRecordatorio(id: string): Promise<Tarea> {
    const tarea = await this.findOne(id);
    await this.notificacionesService.crearRecordatorioTarea(tarea);
    return tarea;
  }
}
