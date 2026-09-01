import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '@dpo/common';
import { Evidencia } from './evidencia.entity';
import { CreateEvidenciaDto } from './dto/create-evidencia.dto';

@Injectable()
export class EvidenciasService {
  constructor(
    @InjectRepository(Evidencia)
    private readonly repo: Repository<Evidencia>,
  ) {}

  create(dto: CreateEvidenciaDto) {
    return this.repo.save(this.repo.create({ ...dto, fechaSubida: new Date() }));
  }

  async findAll(query: PaginationQueryDto, empresaId?: string) {
    const [data, total] = await this.repo.findAndCount({
      where: empresaId ? { empresaId } : {},
      skip: query.skip,
      take: query.limit,
      order: { fechaSubida: 'DESC' },
    });
    return { data, total, page: query.page, limit: query.limit };
  }

  findByReferencia(moduloOrigen: string, referenciaId: string) {
    return this.repo.find({ where: { moduloOrigen, referenciaId } });
  }

  async findOne(id: string) {
    const evidencia = await this.repo.findOne({ where: { id } });
    if (!evidencia) throw new NotFoundException('Evidencia no encontrada');
    return evidencia;
  }

  async remove(id: string) {
    const evidencia = await this.findOne(id);
    await this.repo.remove(evidencia);
  }
}
