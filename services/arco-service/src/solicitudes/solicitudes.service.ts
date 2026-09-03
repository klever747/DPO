import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginationQueryDto } from '@dpo/common';
import { SolicitudArco } from './solicitud-arco.entity';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateSolicitudDto } from './dto/update-solicitud.dto';

const DIAS_LIMITE_RESPUESTA = 20;

@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(SolicitudArco)
    private readonly repo: Repository<SolicitudArco>,
  ) {}

  create(dto: CreateSolicitudDto) {
    const fechaSolicitud = new Date();
    const fechaLimite = new Date(fechaSolicitud);
    fechaLimite.setDate(fechaLimite.getDate() + DIAS_LIMITE_RESPUESTA);
    return this.repo.save(this.repo.create({ ...dto, fechaSolicitud, fechaLimite }));
  }

  async findAll(query: PaginationQueryDto, empresaIds?: string[]) {
    if (empresaIds && empresaIds.length === 0) {
      return { data: [], total: 0, page: query.page, limit: query.limit };
    }
    const [data, total] = await this.repo.findAndCount({
      where: empresaIds ? { empresaId: In(empresaIds) } : {},
      skip: query.skip,
      take: query.limit,
      order: { fechaSolicitud: 'DESC' },
    });
    return { data, total, page: query.page, limit: query.limit };
  }

  async findOne(id: string) {
    const solicitud = await this.repo.findOne({ where: { id } });
    if (!solicitud) throw new NotFoundException('Solicitud ARCO no encontrada');
    return solicitud;
  }

  async update(id: string, dto: UpdateSolicitudDto) {
    const solicitud = await this.findOne(id);
    Object.assign(solicitud, dto);
    if (dto.estado === 'resuelta' || dto.estado === 'rechazada') {
      solicitud.fechaResolucion = new Date();
    }
    return this.repo.save(solicitud);
  }

  async remove(id: string) {
    const solicitud = await this.findOne(id);
    await this.repo.remove(solicitud);
  }
}
