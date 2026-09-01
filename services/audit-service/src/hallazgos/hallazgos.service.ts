import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HallazgoAuditoria } from './hallazgo-auditoria.entity';
import { CreateHallazgoDto } from './dto/create-hallazgo.dto';
import { UpdateHallazgoDto } from './dto/update-hallazgo.dto';

@Injectable()
export class HallazgosService {
  constructor(
    @InjectRepository(HallazgoAuditoria)
    private readonly repo: Repository<HallazgoAuditoria>,
  ) {}

  create(auditoriaId: string, dto: CreateHallazgoDto) {
    return this.repo.save(this.repo.create({ ...dto, auditoriaId }));
  }

  findByAuditoria(auditoriaId: string) {
    return this.repo.find({ where: { auditoriaId } });
  }

  async update(id: string, dto: UpdateHallazgoDto) {
    const hallazgo = await this.repo.findOne({ where: { id } });
    if (!hallazgo) throw new NotFoundException('Hallazgo no encontrado');
    Object.assign(hallazgo, dto);
    return this.repo.save(hallazgo);
  }

  async remove(id: string) {
    const hallazgo = await this.repo.findOne({ where: { id } });
    if (!hallazgo) throw new NotFoundException('Hallazgo no encontrado');
    await this.repo.remove(hallazgo);
  }
}
