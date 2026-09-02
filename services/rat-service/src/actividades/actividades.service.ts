import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginationQueryDto } from '@dpo/common';
import { ActividadTratamiento } from './actividad-tratamiento.entity';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';

@Injectable()
export class ActividadesService {
  constructor(
    @InjectRepository(ActividadTratamiento)
    private readonly repo: Repository<ActividadTratamiento>,
  ) {}

  create(dto: CreateActividadDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: PaginationQueryDto, empresaIds?: string[]) {
    if (empresaIds && empresaIds.length === 0) {
      return { data: [], total: 0, page: query.page, limit: query.limit };
    }
    const [data, total] = await this.repo.findAndCount({
      where: empresaIds ? { empresaId: In(empresaIds) } : {},
      skip: query.skip,
      take: query.limit,
      order: { updatedAt: 'DESC' },
    });
    return { data, total, page: query.page, limit: query.limit };
  }

  async findOne(id: string) {
    const actividad = await this.repo.findOne({ where: { id } });
    if (!actividad) throw new NotFoundException('Actividad de tratamiento no encontrada');
    return actividad;
  }

  async update(id: string, dto: UpdateActividadDto) {
    const actividad = await this.findOne(id);
    Object.assign(actividad, dto);
    return this.repo.save(actividad);
  }

  async remove(id: string) {
    const actividad = await this.findOne(id);
    await this.repo.remove(actividad);
  }
}
