import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RegistroAcceso } from './registro-acceso.entity';
import { Usuario } from '../usuarios/usuario.entity';

@Injectable()
export class RegistroAccesosService {
  constructor(
    @InjectRepository(RegistroAcceso)
    private readonly repo: Repository<RegistroAcceso>,
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
  ) {}

  registrar(email: string, exitoso: boolean, usuarioId?: string) {
    return this.repo.save(this.repo.create({ email, exitoso, usuarioId: usuarioId ?? null }));
  }

  async listar(empresaIds: string[] | undefined, limit = 100) {
    let usuarioIdsFiltro: string[] | undefined;
    if (empresaIds) {
      if (empresaIds.length === 0) return [];
      const usuarios = await this.usuariosRepo
        .createQueryBuilder('u')
        .innerJoin('u.empresas', 'e', 'e.id IN (:...empresaIds)', { empresaIds })
        .getMany();
      usuarioIdsFiltro = usuarios.map((u) => u.id);
      if (usuarioIdsFiltro.length === 0) return [];
    }
    return this.repo.find({
      where: usuarioIdsFiltro ? { usuarioId: In(usuarioIdsFiltro) } : {},
      order: { creadoEn: 'DESC' },
      take: limit,
    });
  }
}
