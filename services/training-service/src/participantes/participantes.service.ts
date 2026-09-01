import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participante, EstadoParticipante } from './participante.entity';
import { CreateParticipanteDto } from './dto/create-participante.dto';
import { UpdateParticipanteDto } from './dto/update-participante.dto';

@Injectable()
export class ParticipantesService {
  constructor(
    @InjectRepository(Participante)
    private readonly repo: Repository<Participante>,
  ) {}

  create(formacionId: string, dto: CreateParticipanteDto) {
    return this.repo.save(this.repo.create({ ...dto, formacionId }));
  }

  findByFormacion(formacionId: string) {
    return this.repo.find({ where: { formacionId } });
  }

  async update(id: string, dto: UpdateParticipanteDto) {
    const participante = await this.repo.findOne({ where: { id } });
    if (!participante) throw new NotFoundException('Participante no encontrado');
    Object.assign(participante, dto);
    if (dto.estado === EstadoParticipante.COMPLETADO) {
      participante.fechaCompletado = new Date();
    }
    return this.repo.save(participante);
  }

  async remove(id: string) {
    const participante = await this.repo.findOne({ where: { id } });
    if (!participante) throw new NotFoundException('Participante no encontrado');
    await this.repo.remove(participante);
  }
}
