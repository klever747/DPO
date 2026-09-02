import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginationQueryDto } from '@dpo/common';
import { PoliticaRetencion } from './politica-retencion.entity';
import { CreatePoliticaDto } from './dto/create-politica.dto';
import { UpdatePoliticaDto } from './dto/update-politica.dto';

@Injectable()
export class PoliticasService {
  constructor(
    @InjectRepository(PoliticaRetencion)
    private readonly repo: Repository<PoliticaRetencion>,
  ) {}

  create(dto: CreatePoliticaDto) {
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
    const politica = await this.repo.findOne({ where: { id } });
    if (!politica) throw new NotFoundException('Política de retención no encontrada');
    return politica;
  }

  async update(id: string, dto: UpdatePoliticaDto) {
    const politica = await this.findOne(id);
    Object.assign(politica, dto);
    return this.repo.save(politica);
  }

  async remove(id: string) {
    const politica = await this.findOne(id);
    await this.repo.remove(politica);
  }
}
