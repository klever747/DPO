import { lazy } from 'react';

export interface ModuleDef {
  path: string;
  label: string;
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
  { path: '/empresas-usuarios', label: 'Empresas y Usuarios', Component: lazy(() => import('companiesUsers/Module')) },
  { path: '/consentimientos', label: 'Consentimientos', Component: lazy(() => import('consents/Module')) },
  { path: '/rat', label: 'Registro de Actividades (RAT)', Component: lazy(() => import('rat/Module')) },
  { path: '/arco', label: 'Derechos ARCO', Component: lazy(() => import('arco/Module')) },
  { path: '/brechas', label: 'Brechas de Seguridad', Component: lazy(() => import('breaches/Module')) },
  { path: '/retencion', label: 'Plazos de Retención', Component: lazy(() => import('retention/Module')) },
  { path: '/canal-etico', label: 'Canal Ético', Component: lazy(() => import('ethicsChannel/Module')) },
  { path: '/madurez', label: 'Madurez', Component: lazy(() => import('maturity/Module')) },
  { path: '/formacion', label: 'Formación', Component: lazy(() => import('training/Module')) },
  { path: '/contratos', label: 'Plantillas de Contratos', Component: lazy(() => import('contracts/Module')) },
  { path: '/auditoria', label: 'Auditoría', Component: lazy(() => import('audit/Module')) },
  { path: '/evidencias', label: 'Evidencias', Component: lazy(() => import('evidence/Module')) },
];
