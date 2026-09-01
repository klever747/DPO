import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '@dpo/common';
import { Titular } from './titular.entity';
import { CreateTitularDto } from './dto/create-titular.dto';
import { UpdateTitularDto } from './dto/update-titular.dto';

@Injectable()
export class TitularesService {
  constructor(
    @InjectRepository(Titular)
    private readonly repo: Repository<Titular>,
  ) {}

  create(dto: CreateTitularDto) {
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
    const titular = await this.repo.findOne({ where: { id } });
    if (!titular) throw new NotFoundException('Titular no encontrado');
    return titular;
  }

  async update(id: string, dto: UpdateTitularDto) {
    const titular = await this.findOne(id);
    Object.assign(titular, dto);
    return this.repo.save(titular);
  }

  async remove(id: string) {
    const titular = await this.findOne(id);
    await this.repo.remove(titular);
  }
}
