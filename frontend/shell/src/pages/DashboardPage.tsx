import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { API_BASE_URL } from '../lib/api';
import { modules } from '../routes/moduleRegistry';
import { useAuth } from '../auth/AuthContext';
import { Icon } from '../ui/Icon';

interface ServiceStatus {
  service: string;
  reachable: boolean;
  status?: string;
}

export function DashboardPage() {
  const { user, canAccessModule } = useAuth();
  const [services, setServices] = useState<ServiceStatus[] | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const visibleModules = modules.filter((m) => canAccessModule(m.key));

  useEffect(() => {
    const statusUrl = `${API_BASE_URL.replace(/\/api$/, '')}/status`;
    fetch(statusUrl)
      .then((res) => res.json())
      .then((data) => setServices(data.services))
      .catch(() => setServices(null))
      .finally(() => setLoadingStatus(false));
  }, []);

  const operativos = services?.filter((s) => s.reachable).length ?? 0;
  const total = services?.length ?? 0;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Bienvenido{user?.email ? `, ${user.email.split('@')[0]}` : ''}</h2>
        <p>Selecciona un módulo en el menú lateral para gestionar cada área de cumplimiento.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary"><Icon name="dashboard" size={20} /></div>
          <div>
            <div className="stat-value">{visibleModules.length}</div>
            <div className="stat-label">Módulos disponibles</div>
          </div>
        </div>
        <div className="stat-card">
          <div className={`stat-icon ${operativos === total && total > 0 ? 'stat-icon-success' : 'stat-icon-warning'}`}>
            <Icon name="shield" size={20} />
          </div>
          <div>
            <div className="stat-value">{loadingStatus ? '…' : `${operativos}/${total}`}</div>
            <div className="stat-label">Microservicios operativos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary"><Icon name="user-check" size={20} /></div>
          <div>
            <div className="stat-value">{user?.rol ?? '—'}</div>
            <div className="stat-label">Tu rol actual</div>
          </div>
        </div>
      </div>

      <div className="dashboard-columns">
        <section className="dpo-card dpo-card-body">
          <h3>Estado de microservicios</h3>
          {!services && !loadingStatus && <p className="dpo-muted">No se pudo obtener el estado de los servicios.</p>}
          {loadingStatus && <p className="dpo-muted">Consultando estado…</p>}
          {services && (
            <ul className="status-list">
              {services.map((s) => (
                <li key={s.service}>
                  <span className={`status-dot ${s.reachable ? 'status-dot-ok' : 'status-dot-down'}`} />
                  <span className="status-name">{s.service}</span>
                  <span className={`dpo-badge ${s.reachable ? 'dpo-badge-success' : 'dpo-badge-danger'}`}>
                    {s.reachable ? 'Operativo' : 'No disponible'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dpo-card dpo-card-body">
          <h3>Accesos rápidos</h3>
          <div className="quick-links">
            {visibleModules.map((m) => (
              <NavLink key={m.path} to={m.path} className="quick-link">
                <Icon name={m.icon} size={17} />
                <span>{m.label}</span>
              </NavLink>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
