import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { JwtPayload } from '@dpo/common';
import { RegistroActividad } from './registro-actividad.entity';
import { CreateRegistroActividadDto } from './dto/create-registro-actividad.dto';

@Injectable()
export class RegistroActividadService {
  constructor(
    @InjectRepository(RegistroActividad)
    private readonly repo: Repository<RegistroActividad>,
  ) {}

  registrar(user: JwtPayload, dto: CreateRegistroActividadDto) {
    return this.repo.save(
      this.repo.create({
        usuarioId: user.sub,
        usuarioEmail: user.email,
        rol: user.rol,
        empresaIds: user.empresaIds ?? [],
        ...dto,
      }),
    );
  }

  async listar(empresaIds: string[] | undefined, limit = 100) {
    if (empresaIds && empresaIds.length === 0) return [];
    return this.repo.find({
      where: empresaIds ? { empresaIds: Raw((alias) => `${alias} && ARRAY[:...empresaIds]::text[]`, { empresaIds }) } : {},
      order: { creadoEn: 'DESC' },
      take: limit,
    });
  }
}
