import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch, omitEmpty } from './lib/api';
import { Icon } from './ui/Icon';
import { Modal } from './ui/Modal';
import { TableSkeleton } from './ui/Skeleton';
import { ToastProvider, useToast } from './ui/Toast';
import './styles.css';

interface EmpresaRef {
  id: string;
  nombre: string;
}

interface Auditoria {
  id: string;
  tipo: string;
  alcance?: string;
  auditor?: string;
  estado: string;
  fechaInicio?: string;
}

interface RegistroActividad {
  id: string;
  usuarioEmail: string;
  rol: string;
  metodo: string;
  ruta: string;
  servicio: string;
  exitoso: boolean;
  statusCode?: number;
  creadoEn: string;
}

interface RegistroAcceso {
  id: string;
  email: string;
  exitoso: boolean;
  creadoEn: string;
}

interface Resumen {
  rat: number;
  consentimientosFirmados: number;
  empresas: number;
  brechas: number;
  arco: number;
}

const TIPOS = ['interna', 'externa', 'seguimiento'];
const ESTADOS = ['planificada', 'en_curso', 'finalizada'];
const emptyForm = { empresaId: '', tipo: 'interna', alcance: '', auditor: '', fechaInicio: '' };

const estadoBadge: Record<string, string> = {
  planificada: 'dpo-badge-neutral',
  en_curso: 'dpo-badge-warning',
  finalizada: 'dpo-badge-success',
};

const SERVICIO_LABEL: Record<string, string> = {
  'auth-service': 'Empresas y Usuarios',
  'consent-service': 'Consentimientos',
  'rat-service': 'RAT',
  'arco-service': 'Derechos ARCO',
  'breach-service': 'Brechas',
  'retention-service': 'Retención',
  'ethics-service': 'Canal Ético',
  'maturity-service': 'Madurez',
  'training-service': 'Formación',
  'contracts-service': 'Contratos',
  'audit-service': 'Auditoría',
  'evidence-service': 'Evidencias',
};

type Tab = 'resumen' | 'actividad' | 'accesos' | 'auditorias';

function ModuleContent() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('resumen');

  const [empresas, setEmpresas] = useState<EmpresaRef[] | null>(null);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [actividad, setActividad] = useState<RegistroActividad[] | null>(null);
  const [accesos, setAccesos] = useState<RegistroAcceso[] | null>(null);
  const [auditorias, setAuditorias] = useState<Auditoria[] | null>(null);

  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function cargarEmpresas() {
    try {
      const res = await apiFetch<{ data: EmpresaRef[] }>('/empresas');
      setEmpresas(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar las empresas: ${(err as Error).message}`);
      setEmpresas([]);
    }
  }

  async function cargarResumen() {
    const total = async (path: string) => {
      try {
        const res = await apiFetch<{ total: number }>(`${path}${path.includes('?') ? '&' : '?'}limit=1`);
        return res.total ?? 0;
      } catch {
        return 0;
      }
    };
    const [rat, consentimientosFirmados, empresasTotal, brechas, arco] = await Promise.all([
      total('/actividades'),
      total('/consentimientos?estado=otorgado'),
      total('/empresas'),
      total('/brechas'),
      total('/solicitudes-arco'),
    ]);
    setResumen({ rat, consentimientosFirmados, empresas: empresasTotal, brechas, arco });
  }

  async function cargarActividad() {
    try {
      const res = await apiFetch<RegistroActividad[]>('/registro-actividad');
      setActividad(res);
    } catch (err) {
      toast.error(`No se pudo cargar la actividad: ${(err as Error).message}`);
      setActividad([]);
    }
  }

  async function cargarAccesos() {
    try {
      const res = await apiFetch<RegistroAcceso[]>('/registro-accesos');
      setAccesos(res);
    } catch (err) {
      toast.error(`No se pudo cargar el historial de accesos: ${(err as Error).message}`);
      setAccesos([]);
    }
  }

  async function cargarAuditorias() {
    try {
      const res = await apiFetch<{ data: Auditoria[] }>('/auditorias');
      setAuditorias(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar las auditorías: ${(err as Error).message}`);
      setAuditorias([]);
    }
  }

  useEffect(() => {
    cargarEmpresas();
    cargarResumen();
    cargarActividad();
    cargarAccesos();
    cargarAuditorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function abrirCrearAuditoria() {
    setForm({ ...emptyForm, empresaId: empresas?.length === 1 ? empresas[0].id : '' });
    setShowModal(true);
  }

  async function crearAuditoria(e: FormEvent) {
    e.preventDefault();
    if (!form.empresaId) {
      toast.error('Selecciona la empresa de la auditoría');
      return;
    }
    setSaving(true);
    try {
      await apiFetch('/auditorias', {
        method: 'POST',
        body: JSON.stringify(omitEmpty({ ...form, fechaInicio: form.fechaInicio || undefined })),
      });
      toast.success('Auditoría registrada');
      setForm(emptyForm);
      setShowModal(false);
      cargarAuditorias();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function cambiarEstadoAuditoria(id: string, estado: string) {
    try {
      await apiFetch(`/auditorias/${id}`, { method: 'PATCH', body: JSON.stringify({ estado }) });
      toast.success('Estado actualizado');
      cargarAuditorias();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function eliminarAuditoria(id: string) {
    if (!confirm('¿Eliminar esta auditoría?')) return;
    try {
      await apiFetch(`/auditorias/${id}`, { method: 'DELETE' });
      toast.success('Auditoría eliminada');
      cargarAuditorias();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const filtradasAuditorias = useMemo(() => {
    if (!auditorias) return [];
    const q = query.trim().toLowerCase();
    if (!q) return auditorias;
    return auditorias.filter((i) => [i.tipo, i.alcance, i.auditor, i.estado].some((v) => v?.toLowerCase().includes(q)));
  }, [auditorias, query]);

  return (
    <div className="dpo-module">
      <div className="dpo-module-header">
        <div>
          <h2>Auditoría</h2>
          <p className="dpo-module-subtitle">Resumen de cumplimiento de la plataforma, actividad de usuarios y auditorías planificadas.</p>
        </div>
        {tab === 'auditorias' && (
          <button className="dpo-btn dpo-btn-primary" onClick={abrirCrearAuditoria}>
            <Icon name="plus" size={16} /> Nueva auditoría
          </button>
        )}
      </div>

      <div className="dpo-tabs">
        <button className={tab === 'resumen' ? 'active' : ''} onClick={() => setTab('resumen')}>
          <Icon name="bar-chart" size={15} /> Resumen
        </button>
        <button className={tab === 'actividad' ? 'active' : ''} onClick={() => setTab('actividad')}>
          <Icon name="clock" size={15} /> Actividad
        </button>
        <button className={tab === 'accesos' ? 'active' : ''} onClick={() => setTab('accesos')}>
          <Icon name="user-check" size={15} /> Accesos
        </button>
        <button className={tab === 'auditorias' ? 'active' : ''} onClick={() => setTab('auditorias')}>
          <Icon name="search" size={15} /> Auditorías
        </button>
      </div>

      {tab === 'resumen' && (
        <>
          <div className="dpo-section-title">Cumplimiento de la plataforma</div>
          {!resumen ? (
            <p className="dpo-muted">Calculando resumen…</p>
          ) : (
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-icon stat-icon-primary"><Icon name="clipboard" size={20} /></div>
                <div>
                  <div className="stat-value">{resumen.rat}</div>
                  <div className="stat-label">Actividades de tratamiento (RAT)</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-success"><Icon name="shield" size={20} /></div>
                <div>
                  <div className="stat-value">{resumen.consentimientosFirmados}</div>
                  <div className="stat-label">Consentimientos firmados</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-primary"><Icon name="building" size={20} /></div>
                <div>
                  <div className="stat-value">{resumen.empresas}</div>
                  <div className="stat-label">Empresas registradas</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-danger"><Icon name="alert-triangle" size={20} /></div>
                <div>
                  <div className="stat-value">{resumen.brechas}</div>
                  <div className="stat-label">Brechas de seguridad reportadas</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-warning"><Icon name="user-check" size={20} /></div>
                <div>
                  <div className="stat-value">{resumen.arco}</div>
                  <div className="stat-label">Derechos ARCO solicitados</div>
                </div>
              </div>
            </div>
          )}

          <div className="dpo-section-title">Actividad reciente</div>
          {actividad === null ? (
            <TableSkeleton />
          ) : actividad.length === 0 ? (
            <p className="dpo-muted">Todavía no hay actividad registrada.</p>
          ) : (
            <div className="dpo-table-wrap">
              <table className="dpo-table">
                <thead><tr><th>Usuario</th><th>Acción</th><th>Módulo</th><th>Resultado</th><th>Fecha</th></tr></thead>
                <tbody>
                  {actividad.slice(0, 8).map((a) => (
                    <tr key={a.id}>
                      <td>{a.usuarioEmail}</td>
                      <td className="dpo-muted">{a.metodo} {a.ruta.replace(/^\/api/, '')}</td>
                      <td>{SERVICIO_LABEL[a.servicio] ?? a.servicio}</td>
                      <td><span className={`dpo-badge ${a.exitoso ? 'dpo-badge-success' : 'dpo-badge-danger'}`}>{a.exitoso ? 'Éxito' : 'Falló'}</span></td>
                      <td className="dpo-muted">{new Date(a.creadoEn).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'actividad' && (
        <>
          <div className="dpo-toolbar">
            <p className="dpo-muted" style={{ margin: 0 }}>Acciones de creación, edición y eliminación realizadas por cada usuario en la plataforma.</p>
            <button className="dpo-btn dpo-btn-secondary dpo-btn-sm" onClick={cargarActividad}>
              <Icon name="clock" size={14} /> Actualizar
            </button>
          </div>
          {actividad === null ? (
            <TableSkeleton />
          ) : actividad.length === 0 ? (
            <div className="dpo-empty">
              <Icon name="clock" size={32} />
              <p className="dpo-empty-title">Sin actividad registrada</p>
              <p>Las acciones de creación, edición y eliminación aparecerán aquí.</p>
            </div>
          ) : (
            <div className="dpo-table-wrap">
              <table className="dpo-table">
                <thead><tr><th>Usuario</th><th>Rol</th><th>Acción</th><th>Módulo</th><th>Resultado</th><th>Fecha</th></tr></thead>
                <tbody>
                  {actividad.map((a) => (
                    <tr key={a.id}>
                      <td>{a.usuarioEmail}</td>
                      <td><span className="dpo-badge dpo-badge-neutral">{a.rol}</span></td>
                      <td className="dpo-muted">{a.metodo} {a.ruta.replace(/^\/api/, '')}</td>
                      <td>{SERVICIO_LABEL[a.servicio] ?? a.servicio}</td>
                      <td>
                        <span className={`dpo-badge ${a.exitoso ? 'dpo-badge-success' : 'dpo-badge-danger'}`}>
                          {a.exitoso ? 'Éxito' : `Falló${a.statusCode ? ` (${a.statusCode})` : ''}`}
                        </span>
                      </td>
                      <td className="dpo-muted">{new Date(a.creadoEn).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'accesos' && (
        <>
          <div className="dpo-toolbar">
            <p className="dpo-muted" style={{ margin: 0 }}>Historial de inicios de sesión a la plataforma, exitosos y fallidos.</p>
            <button className="dpo-btn dpo-btn-secondary dpo-btn-sm" onClick={cargarAccesos}>
              <Icon name="clock" size={14} /> Actualizar
            </button>
          </div>
          {accesos === null ? (
            <TableSkeleton />
          ) : accesos.length === 0 ? (
            <div className="dpo-empty">
              <Icon name="user-check" size={32} />
              <p className="dpo-empty-title">Sin accesos registrados</p>
              <p>Los inicios de sesión a la plataforma aparecerán aquí.</p>
            </div>
          ) : (
            <div className="dpo-table-wrap">
              <table className="dpo-table">
                <thead><tr><th>Email</th><th>Resultado</th><th>Fecha</th></tr></thead>
                <tbody>
                  {accesos.map((a) => (
                    <tr key={a.id}>
                      <td>{a.email}</td>
                      <td><span className={`dpo-badge ${a.exitoso ? 'dpo-badge-success' : 'dpo-badge-danger'}`}>{a.exitoso ? 'Éxito' : 'Falló'}</span></td>
                      <td className="dpo-muted">{new Date(a.creadoEn).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'auditorias' && (
        <>
          <div className="dpo-toolbar">
            <div className="dpo-search">
              <Icon name="search" size={16} />
              <input placeholder="Buscar…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>

          {auditorias === null ? (
            <TableSkeleton />
          ) : filtradasAuditorias.length === 0 ? (
            <div className="dpo-empty">
              <Icon name="search" size={32} />
              <p className="dpo-empty-title">Sin auditorías registradas</p>
              <p>Planifica tu primera auditoría de cumplimiento.</p>
            </div>
          ) : (
            <div className="dpo-table-wrap">
              <table className="dpo-table">
                <thead>
                  <tr><th>Tipo</th><th>Alcance</th><th>Auditor</th><th>Estado</th><th>Inicio</th><th></th></tr>
                </thead>
                <tbody>
                  {filtradasAuditorias.map((a) => (
                    <tr key={a.id}>
                      <td><span className="dpo-badge dpo-badge-neutral">{a.tipo}</span></td>
                      <td>{a.alcance || '—'}</td>
                      <td>{a.auditor || '—'}</td>
                      <td>
                        <select
                          className={`dpo-badge-select ${estadoBadge[a.estado] ?? 'dpo-badge-neutral'}`}
                          value={a.estado}
                          onChange={(e) => cambiarEstadoAuditoria(a.id, e.target.value)}
                        >
                          {ESTADOS.map((es) => <option key={es} value={es}>{es}</option>)}
                        </select>
                      </td>
                      <td className="dpo-muted">{a.fechaInicio ? new Date(a.fechaInicio).toLocaleDateString() : '—'}</td>
                      <td className="dpo-table-actions">
                        <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => eliminarAuditoria(a.id)} title="Eliminar">
                          <Icon name="trash" size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {showModal && (
        <Modal title="Nueva auditoría" onClose={() => setShowModal(false)}>
          <form className="dpo-form" onSubmit={crearAuditoria}>
            {(empresas?.length ?? 0) > 1 && (
              <div className="dpo-field">
                <label>Empresa *</label>
                <select value={form.empresaId} onChange={(e) => setForm({ ...form, empresaId: e.target.value })} required>
                  <option value="">Selecciona una empresa</option>
                  {(empresas ?? []).map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
            )}
            <div className="dpo-field">
              <label>Tipo</label>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="dpo-field">
              <label>Alcance</label>
              <textarea value={form.alcance} onChange={(e) => setForm({ ...form, alcance: e.target.value })} />
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Auditor</label>
                <input value={form.auditor} onChange={(e) => setForm({ ...form, auditor: e.target.value })} />
              </div>
              <div className="dpo-field">
                <label>Fecha de inicio</label>
                <input type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} />
              </div>
            </div>
            <div className="dpo-form-actions">
              <button type="button" className="dpo-btn dpo-btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button type="submit" className="dpo-btn dpo-btn-primary" disabled={saving}>{saving && <span className="dpo-spinner" />} Registrar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default function Module() {
  return (
    <ToastProvider>
      <ModuleContent />
    </ToastProvider>
  );
}
