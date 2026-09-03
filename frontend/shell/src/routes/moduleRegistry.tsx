import { lazy } from 'react';
import { IconName } from '../ui/Icon';

export interface ModuleDef {
  /** Debe coincidir con la clave de módulo del backend (@dpo/common MODULE_CATALOG). */
  key: string;
  path: string;
  label: string;
  icon: IconName;
  Component: React.LazyExoticComponent<React.ComponentType>;
}

/**
 * Registro central de módulos independientes. Cada módulo se compila y
 * despliega por separado (ver frontend/modules/*) y se carga en tiempo de
 * ejecución vía Module Federation. Añadir un módulo nuevo es: (1) darlo de
 * alta aquí y en vite.config.ts (remotes), (2) no toca el código de ningún
 * otro módulo existente.
 */
export const modules: ModuleDef[] = [
  { key: 'empresas-usuarios', path: '/empresas-usuarios', label: 'Empresas y Usuarios', icon: 'building', Component: lazy(() => import('companiesUsers/Module')) },
  { key: 'consentimientos', path: '/consentimientos', label: 'Consentimientos', icon: 'shield', Component: lazy(() => import('consents/Module')) },
  { key: 'rat', path: '/rat', label: 'Registro de Actividades (RAT)', icon: 'clipboard', Component: lazy(() => import('rat/Module')) },
  { key: 'arco', path: '/arco', label: 'Derechos ARCO', icon: 'user-check', Component: lazy(() => import('arco/Module')) },
  { key: 'brechas', path: '/brechas', label: 'Brechas de Seguridad', icon: 'alert-triangle', Component: lazy(() => import('breaches/Module')) },
  { key: 'retencion', path: '/retencion', label: 'Plazos de Retención', icon: 'clock', Component: lazy(() => import('retention/Module')) },
  { key: 'canal-etico', path: '/canal-etico', label: 'Canal Ético', icon: 'message', Component: lazy(() => import('ethicsChannel/Module')) },
  { key: 'madurez', path: '/madurez', label: 'Madurez', icon: 'bar-chart', Component: lazy(() => import('maturity/Module')) },
  { key: 'formacion', path: '/formacion', label: 'Formación', icon: 'book', Component: lazy(() => import('training/Module')) },
  { key: 'contratos', path: '/contratos', label: 'Plantillas de Contratos', icon: 'file-text', Component: lazy(() => import('contracts/Module')) },
  { key: 'auditoria', path: '/auditoria', label: 'Auditoría', icon: 'search', Component: lazy(() => import('audit/Module')) },
  { key: 'evidencias', path: '/evidencias', label: 'Evidencias', icon: 'archive', Component: lazy(() => import('evidence/Module')) },
  { key: 'tareas', path: '/tareas', label: 'Tareas de Cumplimiento', icon: 'check-circle', Component: lazy(() => import('tasks/Module')) },
];
