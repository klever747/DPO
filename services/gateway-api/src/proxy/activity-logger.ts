import type { IncomingMessage, ServerResponse } from 'http';

const AUDIT_SERVICE_URL = process.env.AUDIT_SERVICE_URL || 'http://localhost:3011';
const METODOS_A_REGISTRAR = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

/**
 * Reporta al audit-service que un usuario realizó una acción de escritura en
 * `servicio`. Se llama directamente (no a través del proxy del propio
 * gateway) reenviando el mismo Authorization del usuario, así el audit-service
 * resuelve la identidad desde el JWT en vez de confiar en lo que le enviemos
 * aquí — evita que cualquiera pueda falsificar a nombre de quién quedó
 * registrada la actividad.
 */
export function logActivity(req: IncomingMessage, proxyRes: IncomingMessage, service: string): void {
  const method = req.method ?? '';
  if (!METODOS_A_REGISTRAR.has(method)) return;

  const authHeader = req.headers.authorization;
  if (!authHeader) return; // ruta pública (login/register) o sin sesión

  const statusCode = proxyRes.statusCode ?? 0;
  const body = JSON.stringify({
    metodo: method,
    ruta: (req as any).originalUrl || req.url,
    servicio: service,
    exitoso: statusCode >= 200 && statusCode < 400,
    statusCode,
  });

  fetch(`${AUDIT_SERVICE_URL}/registro-actividad`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authHeader },
    body,
  }).catch((err) => {
    console.error('No se pudo registrar la actividad en audit-service:', err.message);
  });
}
