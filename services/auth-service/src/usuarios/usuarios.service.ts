import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { PaginationQueryDto } from '@dpo/common';
import { Usuario } from './usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepo: Repository<Usuario>,
  ) {}

  async create(dto: CreateUsuarioDto): Promise<Usuario> {
    const existente = await this.usuariosRepo.findOne({ where: { email: dto.email } });
    if (existente) throw new ConflictException('Ya existe un usuario con ese email');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const usuario = this.usuariosRepo.create({
      ...dto,
      passwordHash,
    });
    return this.usuariosRepo.save(usuario);
  }

  findByEmail(email: string): Promise<Usuario | null> {
    return this.usuariosRepo.findOne({ where: { email } });
  }

  async findAll(query: PaginationQueryDto, empresaId?: string) {
    const [data, total] = await this.usuariosRepo.findAndCount({
      where: empresaId ? { empresaId } : {},
      skip: query.skip,
      take: query.limit,
      order: { createdAt: 'DESC' },
    });
    return { data: data.map(this.sanitize), total, page: query.page, limit: query.limit };
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuariosRepo.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async update(id: string, dto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);
    Object.assign(usuario, dto);
    return this.usuariosRepo.save(usuario);
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
