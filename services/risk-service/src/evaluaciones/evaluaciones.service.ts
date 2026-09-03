import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginationQueryDto } from '@dpo/common';
import { EvaluacionRiesgo, NivelRiesgo } from './evaluacion-riesgo.entity';
import { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluacion.dto';

/**
 * Matriz de riesgo 5x5 estándar: probabilidad x impacto = puntaje (1-25).
 * 1-4 bajo, 5-9 medio, 10-15 alto, 16-25 crítico.
 */
export function calcularNivelRiesgo(probabilidad: number, impacto: number): NivelRiesgo {
  const puntaje = probabilidad * impacto;
  if (puntaje <= 4) return NivelRiesgo.BAJO;
  if (puntaje <= 9) return NivelRiesgo.MEDIO;
  if (puntaje <= 15) return NivelRiesgo.ALTO;
  return NivelRiesgo.CRITICO;
}

@Injectable()
export class EvaluacionesService {
  constructor(
    @InjectRepository(EvaluacionRiesgo)
    private readonly repo: Repository<EvaluacionRiesgo>,
  ) {}

  create(dto: CreateEvaluacionDto, creadoPorEmail?: string) {
    const nivelRiesgo = calcularNivelRiesgo(dto.probabilidad, dto.impacto);
    return this.repo.save(
      this.repo.create({
        ...dto,
        nivelRiesgo,
        requiereConsultaPrevia: dto.requiereConsultaPrevia ?? nivelRiesgo === NivelRiesgo.CRITICO,
        fechaEvaluacion: dto.fechaEvaluacion ?? new Date().toISOString().slice(0, 10),
        creadoPorEmail,
      }),
    );
  }

  async findAll(query: PaginationQueryDto, empresaIds: string[] | undefined) {
    if (empresaIds && empresaIds.length === 0) {
      return { data: [], total: 0, page: query.page, limit: query.limit };
    }
    const where: Record<string, unknown> = {};
    if (empresaIds) where.empresaId = In(empresaIds);

    const [data, total] = await this.repo.findAndCount({
      where,
      skip: query.skip,
      take: query.limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page: query.page, limit: query.limit };
  }

  async findOne(id: string): Promise<EvaluacionRiesgo> {
    const evaluacion = await this.repo.findOne({ where: { id } });
    if (!evaluacion) throw new NotFoundException('Evaluación de riesgo no encontrada');
    return evaluacion;
  }

  async update(id: string, dto: UpdateEvaluacionDto): Promise<EvaluacionRiesgo> {
    const evaluacion = await this.findOne(id);
    Object.assign(evaluacion, dto);
    if (dto.probabilidad !== undefined || dto.impacto !== undefined) {
      evaluacion.nivelRiesgo = calcularNivelRiesgo(evaluacion.probabilidad, evaluacion.impacto);
      if (dto.requiereConsultaPrevia === undefined) {
        evaluacion.requiereConsultaPrevia = evaluacion.nivelRiesgo === NivelRiesgo.CRITICO;
      }
    }
    return this.repo.save(evaluacion);
  }

  async remove(id: string): Promise<void> {
    const evaluacion = await this.findOne(id);
    await this.repo.remove(evaluacion);
  }
}
