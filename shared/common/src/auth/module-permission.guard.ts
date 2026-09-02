import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const REQUIRE_MODULE_KEY = 'requireModule';

/** Marca un controlador/handler como perteneciente a un módulo de la plataforma (ver MODULE_CATALOG). */
export const RequireModule = (moduleKey: string) => SetMetadata(REQUIRE_MODULE_KEY, moduleKey);

/**
 * Verifica que el usuario autenticado tenga el módulo requerido dentro de
 * `modulosPermitidos` (super_admin siempre pasa). Se aplica junto a
 * JwtAuthGuard/RolesGuard en cada microservicio — cada uno decora sus
 * controladores principales con @RequireModule('<clave>').
 *
 * Las rutas públicas (@Public()) no llevan `request.user`; en ese caso se
 * deja pasar sin verificar (JwtAuthGuard ya decidió que la ruta es pública).
 */
@Injectable()
export class ModulePermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredModule = this.reflector.getAllAndOverride<string>(REQUIRE_MODULE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredModule) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return true; // ruta pública, sin usuario autenticado

    if (user.rol === 'super_admin') return true;
    if (Array.isArray(user.modulosPermitidos) && user.modulosPermitidos.includes(requiredModule)) {
      return true;
    }

    throw new ForbiddenException(`No tienes acceso al módulo "${requiredModule}"`);
  }
}
