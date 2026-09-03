export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api';

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('dpo_token');
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new Error(message || `Error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

/** Sube un archivo (multipart/form-data) y devuelve la respuesta JSON del backend. */
export async function apiUpload<T = unknown>(path: string, file: File): Promise<T> {
  const token = localStorage.getItem('dpo_token');
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}${path}`, { method: 'POST', body: formData, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new Error(message || `Error ${res.status}`);
  }
  return res.json();
}

/** Descarga un archivo protegido por JWT y lo abre en una pestaña nueva. */
export async function abrirArchivoProtegido(path: string): Promise<void> {
  const token = localStorage.getItem('dpo_token');
  const headers = new Headers();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${API_BASE_URL}${path}`, { headers });
  if (!res.ok) throw new Error('No se pudo abrir el archivo');
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, '_blank');
}

/**
 * Quita claves con valor "" / null / undefined antes de enviar un payload.
 * Los campos opcionales del backend (@IsOptional()) solo se saltan la
 * validación cuando el valor está ausente — un string vacío sigue
 * validándose (p. ej. @IsEmail() rechaza "").
 */
export function omitEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== '' && value !== null && value !== undefined) {
      (result as Record<string, unknown>)[key] = value;
    }
  }
  return result;
}
