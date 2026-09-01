import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from '@dpo/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RolUsuario } from '../usuarios/usuario.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const usuario = await this.usuariosService.create({
      ...dto,
      rol: dto.empresaId ? RolUsuario.ADMIN_EMPRESA : RolUsuario.SUPER_ADMIN,
    });
    return this.buildAuthResponse(usuario.id, usuario.email, usuario.rol, usuario.empresaId ?? null);
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosService.findByEmail(dto.email);
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValida = await bcrypt.compare(dto.password, usuario.passwordHash);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.usuariosService.marcarUltimoAcceso(usuario.id);
    return this.buildAuthResponse(usuario.id, usuario.email, usuario.rol, usuario.empresaId ?? null);
  }

  private buildAuthResponse(sub: string, email: string, rol: string, empresaId: string | null) {
    const payload: JwtPayload = { sub, email, rol, empresaId };
    return {
      accessToken: this.jwtService.sign(payload),
      user: payload,
    };
  }
}
