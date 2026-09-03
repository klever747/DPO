import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sector } from './sector.entity';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';

@Injectable()
export class SectoresService {
  constructor(
    @InjectRepository(Sector)
    private readonly sectoresRepo: Repository<Sector>,
  ) {}

  async create(dto: CreateSectorDto): Promise<Sector> {
    const existente = await this.sectoresRepo.findOne({ where: { nombre: dto.nombre } });
    if (existente) throw new ConflictException('Ya existe un sector con ese nombre');
    return this.sectoresRepo.save(this.sectoresRepo.create(dto));
  }

  findAll(): Promise<Sector[]> {
    return this.sectoresRepo.find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: string): Promise<Sector> {
    const sector = await this.sectoresRepo.findOne({ where: { id } });
    if (!sector) throw new NotFoundException('Sector no encontrado');
    return sector;
  }

  async update(id: string, dto: UpdateSectorDto): Promise<Sector> {
    const sector = await this.findOne(id);
    if (dto.nombre && dto.nombre !== sector.nombre) {
      const existente = await this.sectoresRepo.findOne({ where: { nombre: dto.nombre } });
      if (existente) throw new ConflictException('Ya existe un sector con ese nombre');
    }
    Object.assign(sector, dto);
    return this.sectoresRepo.save(sector);
  }

  async remove(id: string): Promise<void> {
    const sector = await this.findOne(id);
    await this.sectoresRepo.remove(sector);
  }
}
