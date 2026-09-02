import { lazy } from 'react';
import { IconName } from '../ui/Icon';

export interface ModuleDef {
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
  { path: '/empresas-usuarios', label: 'Empresas y Usuarios', icon: 'building', Component: lazy(() => import('companiesUsers/Module')) },
  { path: '/consentimientos', label: 'Consentimientos', icon: 'shield', Component: lazy(() => import('consents/Module')) },
  { path: '/rat', label: 'Registro de Actividades (RAT)', icon: 'clipboard', Component: lazy(() => import('rat/Module')) },
  { path: '/arco', label: 'Derechos ARCO', icon: 'user-check', Component: lazy(() => import('arco/Module')) },
  { path: '/brechas', label: 'Brechas de Seguridad', icon: 'alert-triangle', Component: lazy(() => import('breaches/Module')) },
  { path: '/retencion', label: 'Plazos de Retención', icon: 'clock', Component: lazy(() => import('retention/Module')) },
  { path: '/canal-etico', label: 'Canal Ético', icon: 'message', Component: lazy(() => import('ethicsChannel/Module')) },
  { path: '/madurez', label: 'Madurez', icon: 'bar-chart', Component: lazy(() => import('maturity/Module')) },
  { path: '/formacion', label: 'Formación', icon: 'book', Component: lazy(() => import('training/Module')) },
  { path: '/contratos', label: 'Plantillas de Contratos', icon: 'file-text', Component: lazy(() => import('contracts/Module')) },
  { path: '/auditoria', label: 'Auditoría', icon: 'search', Component: lazy(() => import('audit/Module')) },
  { path: '/evidencias', label: 'Evidencias', icon: 'archive', Component: lazy(() => import('evidence/Module')) },
];
