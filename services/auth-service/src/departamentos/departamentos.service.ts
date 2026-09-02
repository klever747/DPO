import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Departamento } from './departamento.entity';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';

@Injectable()
export class DepartamentosService {
  constructor(
    @InjectRepository(Departamento)
    private readonly repo: Repository<Departamento>,
  ) {}

  async create(dto: CreateDepartamentoDto): Promise<Departamento> {
    const existente = await this.repo.findOne({ where: { empresaId: dto.empresaId, nombre: dto.nombre } });
    if (existente) throw new ConflictException('Ya existe un departamento con ese nombre en esta empresa');
    return this.repo.save(this.repo.create(dto));
  }

  findAll(empresaIds?: string[]): Promise<Departamento[]> {
    if (empresaIds && empresaIds.length === 0) return Promise.resolve([]);
    return this.repo.find({
      where: empresaIds ? { empresaId: In(empresaIds) } : {},
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Departamento> {
    const departamento = await this.repo.findOne({ where: { id } });
    if (!departamento) throw new NotFoundException('Departamento no encontrado');
    return departamento;
  }

  async update(id: string, dto: UpdateDepartamentoDto): Promise<Departamento> {
    const departamento = await this.findOne(id);
    const empresaId = dto.empresaId ?? departamento.empresaId;
    if (dto.nombre && (dto.nombre !== departamento.nombre || empresaId !== departamento.empresaId)) {
      const existente = await this.repo.findOne({ where: { empresaId, nombre: dto.nombre } });
      if (existente && existente.id !== id) {
        throw new ConflictException('Ya existe un departamento con ese nombre en esta empresa');
      }
    }
    Object.assign(departamento, dto);
    return this.repo.save(departamento);
  }

  async remove(id: string): Promise<void> {
    const departamento = await this.findOne(id);
    await this.repo.remove(departamento);
  }
}
