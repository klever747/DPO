import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginationQueryDto } from '@dpo/common';
import { Titular } from './titular.entity';
import { TitularEmpresa } from './titular-empresa.entity';
import { CreateTitularDto } from './dto/create-titular.dto';
import { UpdateTitularDto } from './dto/update-titular.dto';

@Injectable()
export class TitularesService {
  constructor(
    @InjectRepository(Titular)
    private readonly repo: Repository<Titular>,
    @InjectRepository(TitularEmpresa)
    private readonly titularEmpresaRepo: Repository<TitularEmpresa>,
  ) {}

  private async attachEmpresaIds<T extends Titular>(titulares: T[]): Promise<(T & { empresaIds: string[] })[]> {
    if (titulares.length === 0) return [];
    const rows = await this.titularEmpresaRepo.find({ where: { titularId: In(titulares.map((t) => t.id)) } });
    const map = new Map<string, string[]>();
    rows.forEach((r) => map.set(r.titularId, [...(map.get(r.titularId) ?? []), r.empresaId]));
    return titulares.map((t) => ({ ...t, empresaIds: map.get(t.id) ?? [] }));
  }

  private async setEmpresas(titularId: string, empresaIds: string[]) {
    await this.titularEmpresaRepo.delete({ titularId });
    await this.titularEmpresaRepo.save(empresaIds.map((empresaId) => this.titularEmpresaRepo.create({ titularId, empresaId })));
  }

  async create(dto: CreateTitularDto) {
    const { empresaIds, ...rest } = dto;
    const titular = await this.repo.save(this.repo.create({ ...rest, empresaId: empresaIds[0] }));
    await this.setEmpresas(titular.id, empresaIds);
    return { ...titular, empresaIds };
  }

  async findAll(query: PaginationQueryDto, empresaIds?: string[]) {
    if (empresaIds && empresaIds.length === 0) {
      return { data: [], total: 0, page: query.page, limit: query.limit };
    }
    let titularIdsFilter: string[] | undefined;
    if (empresaIds) {
      const rows = await this.titularEmpresaRepo.find({ where: { empresaId: In(empresaIds) } });
      titularIdsFilter = [...new Set(rows.map((r) => r.titularId))];
      if (titularIdsFilter.length === 0) {
        return { data: [], total: 0, page: query.page, limit: query.limit };
      }
    }
    const [data, total] = await this.repo.findAndCount({
      where: titularIdsFilter ? { id: In(titularIdsFilter) } : {},
      skip: query.skip,
      take: query.limit,
      order: { createdAt: 'DESC' },
    });
    return { data: await this.attachEmpresaIds(data), total, page: query.page, limit: query.limit };
  }

  private async findOneRaw(id: string): Promise<Titular> {
    const titular = await this.repo.findOne({ where: { id } });
    if (!titular) throw new NotFoundException('Titular no encontrado');
    return titular;
  }

  async findOne(id: string) {
    const titular = await this.findOneRaw(id);
    const [withEmpresas] = await this.attachEmpresaIds([titular]);
    return withEmpresas;
  }

  async update(id: string, dto: UpdateTitularDto) {
    const titular = await this.findOneRaw(id);
    const { empresaIds, ...rest } = dto;
    Object.assign(titular, rest, empresaIds ? { empresaId: empresaIds[0] } : {});
    await this.repo.save(titular);
    if (empresaIds) await this.setEmpresas(id, empresaIds);
    return this.findOne(id);
  }

  async remove(id: string) {
    const titular = await this.findOneRaw(id);
    await this.repo.remove(titular);
  }
}
