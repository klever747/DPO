export interface ServiceRoute {
  /** Prefijo público expuesto por el gateway, ej. /api/consentimientos */
  prefix: string;
  /** URL base del microservicio destino */
  target: string;
  /** Nombre lógico del servicio (para logs/estado) */
  service: string;
}

/**
 * Tabla de enrutamiento del API Gateway. Cada entrada mapea un prefijo
 * público hacia un microservicio independiente. Añadir un módulo nuevo al
 * sistema es tan simple como añadir una fila aquí y desplegar su propio
 * servicio — no requiere tocar el resto de servicios existentes.
 */
export function buildServiceRoutes(): ServiceRoute[] {
  const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
  const consentServiceUrl = process.env.CONSENT_SERVICE_URL || 'http://localhost:3002';

  return [
    { prefix: '/api/auth', target: authServiceUrl, service: 'auth-service' },
    { prefix: '/api/empresas', target: authServiceUrl, service: 'auth-service' },
    { prefix: '/api/usuarios', target: authServiceUrl, service: 'auth-service' },
    { prefix: '/api/sectores', target: authServiceUrl, service: 'auth-service' },
    { prefix: '/api/titulares', target: consentServiceUrl, service: 'consent-service' },
    { prefix: '/api/consentimientos', target: consentServiceUrl, service: 'consent-service' },
    { prefix: '/api/actividades', target: process.env.RAT_SERVICE_URL || 'http://localhost:3003', service: 'rat-service' },
    { prefix: '/api/solicitudes-arco', target: process.env.ARCO_SERVICE_URL || 'http://localhost:3004', service: 'arco-service' },
    { prefix: '/api/brechas', target: process.env.BREACH_SERVICE_URL || 'http://localhost:3005', service: 'breach-service' },
    { prefix: '/api/politicas-retencion', target: process.env.RETENTION_SERVICE_URL || 'http://localhost:3006', service: 'retention-service' },
    { prefix: '/api/denuncias', target: process.env.ETHICS_SERVICE_URL || 'http://localhost:3007', service: 'ethics-service' },
    { prefix: '/api/evaluaciones-madurez', target: process.env.MATURITY_SERVICE_URL || 'http://localhost:3008', service: 'maturity-service' },
    { prefix: '/api/formaciones', target: process.env.TRAINING_SERVICE_URL || 'http://localhost:3009', service: 'training-service' },
    { prefix: '/api/plantillas-contrato', target: process.env.CONTRACTS_SERVICE_URL || 'http://localhost:3010', service: 'contracts-service' },
    { prefix: '/api/contratos-asignados', target: process.env.CONTRACTS_SERVICE_URL || 'http://localhost:3010', service: 'contracts-service' },
    { prefix: '/api/auditorias', target: process.env.AUDIT_SERVICE_URL || 'http://localhost:3011', service: 'audit-service' },
    { prefix: '/api/evidencias', target: process.env.EVIDENCE_SERVICE_URL || 'http://localhost:3012', service: 'evidence-service' },
  ];
}
