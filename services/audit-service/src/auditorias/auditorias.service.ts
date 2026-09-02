import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginationQueryDto } from '@dpo/common';
import { Auditoria } from './auditoria.entity';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';

@Injectable()
export class AuditoriasService {
  constructor(
    @InjectRepository(Auditoria)
    private readonly repo: Repository<Auditoria>,
  ) {}

  create(dto: CreateAuditoriaDto) {
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
      order: { createdAt: 'DESC' },
    });
    return { data, total, page: query.page, limit: query.limit };
  }

  async findOne(id: string) {
    const auditoria = await this.repo.findOne({ where: { id }, relations: ['hallazgos'] });
    if (!auditoria) throw new NotFoundException('Auditoría no encontrada');
    return auditoria;
  }

  async update(id: string, dto: UpdateAuditoriaDto) {
    const auditoria = await this.findOne(id);
    Object.assign(auditoria, dto);
    return this.repo.save(auditoria);
  }

  async remove(id: string) {
    const auditoria = await this.findOne(id);
    await this.repo.remove(auditoria);
  }
}
