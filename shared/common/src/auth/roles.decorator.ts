import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export type Rol =
  | 'super_admin'
  | 'admin_empresa'
  | 'dpo'
  | 'gestor'
  | 'auditor'
  | 'empleado';

export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
