import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginationQueryDto } from '@dpo/common';
import { Consentimiento, EstadoConsentimiento } from './consentimiento.entity';
import { CreateConsentimientoDto } from './dto/create-consentimiento.dto';
import { UpdateConsentimientoDto } from './dto/update-consentimiento.dto';

@Injectable()
export class ConsentimientosService {
  constructor(
    @InjectRepository(Consentimiento)
    private readonly repo: Repository<Consentimiento>,
  ) {}

  create(dto: CreateConsentimientoDto) {
    return this.repo.save(
      this.repo.create({
        ...dto,
        fechaOtorgamiento: new Date(),
        estado: EstadoConsentimiento.OTORGADO,
      }),
    );
  }

  async findAll(query: PaginationQueryDto, empresaIds?: string[], estado?: EstadoConsentimiento) {
    if (empresaIds && empresaIds.length === 0) {
      return { data: [], total: 0, page: query.page, limit: query.limit };
    }
    const [data, total] = await this.repo.findAndCount({
      where: { ...(empresaIds ? { empresaId: In(empresaIds) } : {}), ...(estado ? { estado } : {}) },
      skip: query.skip,
      take: query.limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page: query.page, limit: query.limit };
  }

  async findOne(id: string) {
    const consentimiento = await this.repo.findOne({ where: { id } });
    if (!consentimiento) throw new NotFoundException('Consentimiento no encontrado');
    return consentimiento;
  }

  async findByTitular(titularId: string) {
    return this.repo.find({ where: { titularId }, order: { createdAt: 'DESC' } });
  }

  async update(id: string, dto: UpdateConsentimientoDto) {
    const consentimiento = await this.findOne(id);
    Object.assign(consentimiento, dto);
    return this.repo.save(consentimiento);
  }

  async revocar(id: string) {
    const consentimiento = await this.findOne(id);
    consentimiento.estado = EstadoConsentimiento.REVOCADO;
    consentimiento.fechaRevocacion = new Date();
    return this.repo.save(consentimiento);
  }

  async remove(id: string) {
    const consentimiento = await this.findOne(id);
    await this.repo.remove(consentimiento);
  }
}
