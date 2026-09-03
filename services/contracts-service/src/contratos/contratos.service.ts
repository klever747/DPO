import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '@dpo/common';
import { ContratoAsignado } from './contrato-asignado.entity';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';

@Injectable()
export class ContratosService {
  constructor(
    @InjectRepository(ContratoAsignado)
    private readonly repo: Repository<ContratoAsignado>,
  ) {}

  create(dto: CreateContratoDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: PaginationQueryDto) {
    const [data, total] = await this.repo.findAndCount({
      skip: query.skip,
      take: query.limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page: query.page, limit: query.limit };
  }

  async findOne(id: string) {
    const contrato = await this.repo.findOne({ where: { id } });
    if (!contrato) throw new NotFoundException('Contrato no encontrado');
    return contrato;
  }

  async update(id: string, dto: UpdateContratoDto) {
    const contrato = await this.findOne(id);
    Object.assign(contrato, dto);
    return this.repo.save(contrato);
  }

  async remove(id: string) {
    const contrato = await this.findOne(id);
    await this.repo.remove(contrato);
  }
}
