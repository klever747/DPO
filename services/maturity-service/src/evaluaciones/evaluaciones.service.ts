import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async findAll(query: PaginationQueryDto, empresaId?: string) {
    const [data, total] = await this.repo.findAndCount({
      where: empresaId ? { empresaId } : {},
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
