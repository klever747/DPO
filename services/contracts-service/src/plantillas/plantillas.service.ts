import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '@dpo/common';
import { PlantillaContrato } from './plantilla-contrato.entity';
import { CreatePlantillaDto } from './dto/create-plantilla.dto';
import { UpdatePlantillaDto } from './dto/update-plantilla.dto';

@Injectable()
export class PlantillasService {
  constructor(
    @InjectRepository(PlantillaContrato)
    private readonly repo: Repository<PlantillaContrato>,
  ) {}

  create(dto: CreatePlantillaDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: PaginationQueryDto, empresaId?: string) {
    const [data, total] = await this.repo.findAndCount({
      where: empresaId ? { empresaId } : {},
      skip: query.skip,
      take: query.limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page: query.page, limit: query.limit };
  }

  async findOne(id: string) {
    const plantilla = await this.repo.findOne({ where: { id } });
    if (!plantilla) throw new NotFoundException('Plantilla de contrato no encontrada');
    return plantilla;
  }

  async update(id: string, dto: UpdatePlantillaDto) {
    const plantilla = await this.findOne(id);
    Object.assign(plantilla, dto);
    return this.repo.save(plantilla);
  }

  async remove(id: string) {
    const plantilla = await this.findOne(id);
    await this.repo.remove(plantilla);
  }
}
