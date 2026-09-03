import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginationQueryDto } from '@dpo/common';
import { Formacion } from './formacion.entity';
import { CreateFormacionDto } from './dto/create-formacion.dto';
import { UpdateFormacionDto } from './dto/update-formacion.dto';

@Injectable()
export class FormacionesService {
  constructor(
    @InjectRepository(Formacion)
    private readonly repo: Repository<Formacion>,
  ) {}

  create(dto: CreateFormacionDto) {
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
    const formacion = await this.repo.findOne({ where: { id }, relations: ['participantes'] });
    if (!formacion) throw new NotFoundException('Formación no encontrada');
    return formacion;
  }

  async update(id: string, dto: UpdateFormacionDto) {
    const formacion = await this.findOne(id);
    Object.assign(formacion, dto);
    return this.repo.save(formacion);
  }

  async remove(id: string) {
    const formacion = await this.findOne(id);
    await this.repo.remove(formacion);
  }
}
