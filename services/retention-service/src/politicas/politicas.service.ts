import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async findAll(query: PaginationQueryDto, empresaId?: string) {
    const [data, total] = await this.repo.findAndCount({
      where: empresaId ? { empresaId } : {},
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
