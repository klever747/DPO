import { useEffect, useState } from 'react';
import { apiFetch } from './lib/api';
import './styles.css';

/**
 * Módulo "Auditoría" — esqueleto funcional conectado a su propio
 * microservicio (/auditorias vía el API Gateway). Lista los registros
 * existentes; ampliar con formularios de alta/edición siguiendo el mismo
 * patrón usado en los módulos completos (companies-users, consents, rat).
 */
export default function Module() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Record<string, unknown>[] }>('/auditorias')
      .then((res) => setItems(res.data))
      .catch((err) => setError((err as Error).message));
  }, []);

  return (
    <div className="dpo-module">
      <h2>Auditoría</h2>
      {error && <p className="dpo-error">{error}</p>}

      {items.length === 0 && !error && (
        <div className="dpo-placeholder">
          <p>Aún no hay registros de "Auditoría".</p>
          <p>Este módulo ya está conectado a su microservicio (`/auditorias`) y listo para ampliarse con formularios de alta y edición.</p>
        </div>
      )}

      {items.length > 0 && (
        <table className="dpo-table">
          <thead>
            <tr>
              {Object.keys(items[0]).slice(0, 5).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                {Object.keys(items[0]).slice(0, 5).map((key) => (
                  <td key={key}>{String(item[key as keyof typeof item] ?? '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
