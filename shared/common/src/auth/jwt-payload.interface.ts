export interface JwtPayload {
  sub: string;
  email: string;
  rol: string;
  /** IDs de todas las empresas a las que el usuario tiene acceso (relación muchos-a-muchos). Vacío para super_admin (ve todas). */
  empresaIds: string[];
  /** Claves de módulo (ver MODULE_CATALOG) que el usuario puede ver/usar. super_admin las tiene todas implícitamente. */
  modulosPermitidos: string[];
}
