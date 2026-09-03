import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { JwtPayload, MODULE_KEYS } from '@dpo/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RolUsuario, Usuario } from '../usuarios/usuario.entity';
import { RegistroAccesosService } from '../registro-accesos/registro-accesos.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly registroAccesosService: RegistroAccesosService,
  ) {}

  async register(dto: RegisterDto) {
    const esAdminEmpresa = !!dto.empresaIds?.length;
    const usuario = await this.usuariosService.create({
      ...dto,
      rol: esAdminEmpresa ? RolUsuario.ADMIN_EMPRESA : RolUsuario.SUPER_ADMIN,
      // El primer usuario de una empresa (o el super_admin fundador) arranca
      // con acceso a todos los módulos; se puede ajustar después.
      modulosPermitidos: MODULE_KEYS,
    });
    return this.buildAuthResponse(usuario);
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosService.findByEmail(dto.email);
    if (!usuario || !usuario.activo) {
      await this.registroAccesosService.registrar(dto.email, false);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValida = await bcrypt.compare(dto.password, usuario.passwordHash);
    if (!passwordValida) {
      await this.registroAccesosService.registrar(dto.email, false, usuario.id);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.usuariosService.marcarUltimoAcceso(usuario.id);
    await this.registroAccesosService.registrar(dto.email, true, usuario.id);
    return this.buildAuthResponse(usuario);
  }

  private buildAuthResponse(usuario: Usuario) {
    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      empresaIds: (usuario.empresas ?? []).map((e) => e.id),
      modulosPermitidos: usuario.modulosPermitidos ?? [],
    };
    return {
      accessToken: this.jwtService.sign(payload),
      user: payload,
    };
  }
}
