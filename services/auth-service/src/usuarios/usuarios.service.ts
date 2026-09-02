import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { PaginationQueryDto } from '@dpo/common';
import { Usuario } from './usuario.entity';
import { Empresa } from '../empresas/empresa.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
    @InjectRepository(Empresa)
    private readonly empresasRepo: Repository<Empresa>,
  ) {}

  private async resolveEmpresas(empresaIds?: string[]): Promise<Empresa[] | undefined> {
    if (empresaIds === undefined) return undefined;
    if (empresaIds.length === 0) return [];
    return this.empresasRepo.findBy({ id: In(empresaIds) });
  }

  async create(dto: CreateUsuarioDto): Promise<Usuario> {
    const existente = await this.usuariosRepo.findOne({ where: { email: dto.email } });
    if (existente) throw new ConflictException('Ya existe un usuario con ese email');

    const { empresaIds, password, ...rest } = dto;
    const passwordHash = await bcrypt.hash(password, 10);
    const empresas = (await this.resolveEmpresas(empresaIds)) ?? [];

    const usuario = this.usuariosRepo.create({
      ...rest,
      passwordHash,
      empresas,
    });
    const saved = await this.usuariosRepo.save(usuario);
    return this.sanitize(await this.findOne(saved.id)) as Usuario;
  }

  findByEmail(email: string): Promise<Usuario | null> {
    return this.usuariosRepo.findOne({ where: { email }, relations: ['empresas'] });
  }

  async findAll(query: PaginationQueryDto, empresaIds?: string[]) {
    const qb = this.usuariosRepo
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.empresas', 'empresa')
      .orderBy('usuario.createdAt', 'DESC')
      .skip(query.skip)
      .take(query.limit);

    if (empresaIds) {
      if (empresaIds.length === 0) {
        return { data: [], total: 0, page: query.page, limit: query.limit };
      }
      qb.innerJoin('usuario.empresas', 'filtroEmpresa', 'filtroEmpresa.id IN (:...empresaIds)', { empresaIds });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data: data.map((u) => this.sanitize(u)), total, page: query.page, limit: query.limit };
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuariosRepo.findOne({ where: { id }, relations: ['empresas'] });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async update(id: string, dto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);
    const { empresaIds, password, ...rest } = dto;

    Object.assign(usuario, rest);

    if (empresaIds !== undefined) {
      usuario.empresas = (await this.resolveEmpresas(empresaIds)) ?? [];
    }
    if (password) {
      usuario.passwordHash = await bcrypt.hash(password, 10);
    }

    const saved = await this.usuariosRepo.save(usuario);
    return this.sanitize(await this.findOne(saved.id)) as Usuario;
  }

  async remove(id: string): Promise<void> {
    const usuario = await this.findOne(id);
    await this.usuariosRepo.remove(usuario);
  }

  async marcarUltimoAcceso(id: string): Promise<void> {
    await this.usuariosRepo.update(id, { ultimoAcceso: new Date() });
  }

  sanitize(usuario: Usuario) {
    const { passwordHash, ...rest } = usuario;
    return rest;
  }
}
