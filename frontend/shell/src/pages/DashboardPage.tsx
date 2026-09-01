import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../lib/api';
import { modules } from '../routes/moduleRegistry';

interface ServiceStatus {
  service: string;
  reachable: boolean;
  status?: string;
}

export function DashboardPage() {
  const [services, setServices] = useState<ServiceStatus[] | null>(null);

  useEffect(() => {
    const statusUrl = `${API_BASE_URL.replace(/\/api$/, '')}/status`;
    fetch(statusUrl)
      .then((res) => res.json())
      .then((data) => setServices(data.services))
      .catch(() => setServices(null));
  }, []);

  return (
    <div>
      <h2>Panel general</h2>
      <p>Selecciona un módulo en el menú lateral para gestionar cada área de cumplimiento.</p>

      <h3>Estado de microservicios</h3>
      {!services && <p>No se pudo obtener el estado de los servicios.</p>}
      {services && (
        <table className="status-table">
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.service}>
                <td>{s.service}</td>
                <td className={s.reachable ? 'ok' : 'down'}>{s.reachable ? 'Operativo' : 'No disponible'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Módulos disponibles</h3>
      <ul className="module-grid">
        {modules.map((m) => (
          <li key={m.path}>{m.label}</li>
        ))}
      </ul>
    </div>
  );
}
