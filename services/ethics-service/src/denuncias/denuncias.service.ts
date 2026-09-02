import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { In, Repository } from 'typeorm';
import { PaginationQueryDto } from '@dpo/common';
import { Denuncia, EstadoDenuncia } from './denuncia.entity';
import { CreateDenunciaDto } from './dto/create-denuncia.dto';
import { UpdateDenunciaDto } from './dto/update-denuncia.dto';

@Injectable()
export class DenunciasService {
  constructor(
    @InjectRepository(Denuncia)
    private readonly repo: Repository<Denuncia>,
  ) {}

  create(dto: CreateDenunciaDto) {
    const codigoSeguimiento = `ETH-${randomUUID().slice(0, 8).toUpperCase()}`;
    return this.repo.save(
      this.repo.create({ ...dto, codigoSeguimiento, fechaRecepcion: new Date() }),
    );
  }

  async findAll(query: PaginationQueryDto, empresaIds?: string[]) {
    if (empresaIds && empresaIds.length === 0) {
      return { data: [], total: 0, page: query.page, limit: query.limit };
    }
    const [data, total] = await this.repo.findAndCount({
      where: empresaIds ? { empresaId: In(empresaIds) } : {},
      skip: query.skip,
      take: query.limit,
      order: { fechaRecepcion: 'DESC' },
    });
    return { data, total, page: query.page, limit: query.limit };
  }

  async findOne(id: string) {
    const denuncia = await this.repo.findOne({ where: { id } });
    if (!denuncia) throw new NotFoundException('Denuncia no encontrada');
    return denuncia;
  }

  async findByCodigo(codigoSeguimiento: string) {
    const denuncia = await this.repo.findOne({ where: { codigoSeguimiento } });
    if (!denuncia) throw new NotFoundException('Denuncia no encontrada');
    return denuncia;
  }

  async update(id: string, dto: UpdateDenunciaDto) {
    const denuncia = await this.findOne(id);
    Object.assign(denuncia, dto);
    if (dto.estado === EstadoDenuncia.RESUELTA || dto.estado === EstadoDenuncia.ARCHIVADA) {
      denuncia.fechaCierre = new Date();
    }
    return this.repo.save(denuncia);
  }

  async remove(id: string) {
    const denuncia = await this.findOne(id);
    await this.repo.remove(denuncia);
  }
}
