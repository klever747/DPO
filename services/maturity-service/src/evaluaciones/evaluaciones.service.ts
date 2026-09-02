import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginationQueryDto } from '@dpo/common';
import { EvaluacionMadurez } from './evaluacion-madurez.entity';
import { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluacion.dto';

@Injectable()
export class EvaluacionesService {
  constructor(
    @InjectRepository(EvaluacionMadurez)
    private readonly repo: Repository<EvaluacionMadurez>,
  ) {}

  create(dto: CreateEvaluacionDto) {
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
      order: { fechaEvaluacion: 'DESC' },
    });
    return { data, total, page: query.page, limit: query.limit };
  }

  async findOne(id: string) {
    const evaluacion = await this.repo.findOne({ where: { id } });
    if (!evaluacion) throw new NotFoundException('Evaluación de madurez no encontrada');
    return evaluacion;
  }

  async update(id: string, dto: UpdateEvaluacionDto) {
    const evaluacion = await this.findOne(id);
    Object.assign(evaluacion, dto);
    return this.repo.save(evaluacion);
  }

  async remove(id: string) {
    const evaluacion = await this.findOne(id);
    await this.repo.remove(evaluacion);
  }
}
