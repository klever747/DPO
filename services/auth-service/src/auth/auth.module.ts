import { Module } from '@nestjs/common';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { RegistroAccesosModule } from '../registro-accesos/registro-accesos.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [UsuariosModule, RegistroAccesosModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
