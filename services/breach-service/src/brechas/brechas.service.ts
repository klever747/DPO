import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '@dpo/common';
import { BrechaSeguridad } from './brecha-seguridad.entity';
import { CreateBrechaDto } from './dto/create-brecha.dto';
import { UpdateBrechaDto } from './dto/update-brecha.dto';

@Injectable()
export class BrechasService {
  constructor(
    @InjectRepository(BrechaSeguridad)
    private readonly repo: Repository<BrechaSeguridad>,
  ) {}

  create(dto: CreateBrechaDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: PaginationQueryDto, empresaId?: string) {
    const [data, total] = await this.repo.findAndCount({
      where: empresaId ? { empresaId } : {},
      skip: query.skip,
      take: query.limit,
      order: { fechaDeteccion: 'DESC' },
    });
    return { data, total, page: query.page, limit: query.limit };
  }

  async findOne(id: string) {
    const brecha = await this.repo.findOne({ where: { id } });
    if (!brecha) throw new NotFoundException('Brecha de seguridad no encontrada');
    return brecha;
  }

  async update(id: string, dto: UpdateBrechaDto) {
    const brecha = await this.findOne(id);
    Object.assign(brecha, dto);
    return this.repo.save(brecha);
  }

  async remove(id: string) {
    const brecha = await this.findOne(id);
    await this.repo.remove(brecha);
  }
}
