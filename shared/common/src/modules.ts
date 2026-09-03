/**
 * Catálogo canónico de módulos de la plataforma. La clave (`key`) es la que
 * se guarda en `usuarios.modulos_permitidos` y en el JWT — debe coincidir
 * exactamente con la usada por cada microservicio en `@RequireModule(...)`
 * y por el frontend en `frontend/shell/src/routes/moduleRegistry.tsx`.
 */
export interface ModuleCatalogEntry {
  key: string;
  label: string;
}

export const MODULE_CATALOG: ModuleCatalogEntry[] = [
  { key: 'empresas-usuarios', label: 'Empresas y Usuarios' },
  { key: 'consentimientos', label: 'Consentimientos' },
  { key: 'rat', label: 'Registro de Actividades (RAT)' },
  { key: 'arco', label: 'Derechos ARCO' },
  { key: 'brechas', label: 'Brechas de Seguridad' },
  { key: 'retencion', label: 'Plazos de Retención' },
  { key: 'canal-etico', label: 'Canal Ético' },
  { key: 'madurez', label: 'Madurez' },
  { key: 'formacion', label: 'Formación' },
  { key: 'contratos', label: 'Plantillas de Contratos' },
  { key: 'auditoria', label: 'Auditoría' },
  { key: 'evidencias', label: 'Evidencias' },
  { key: 'tareas', label: 'Tareas de Cumplimiento' },
];

export const MODULE_KEYS = MODULE_CATALOG.map((m) => m.key);
