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

interface Titular {
  id: string;
  nombre: string;
  email?: string;
  documentoIdentidad?: string;
}

interface Consentimiento {
  id: string;
  titularId: string;
  finalidad: string;
  canal: string;
  estado: string;
  fechaOtorgamiento: string;
}

const emptyTitular = { nombre: '', documentoIdentidad: '', email: '', empresaId: '' };
const emptyConsentimiento = { titularId: '', finalidad: '', baseLegal: '', canal: 'web', empresaId: '' };

const estadoBadge: Record<string, string> = {
  otorgado: 'dpo-badge-success',
  revocado: 'dpo-badge-danger',
  expirado: 'dpo-badge-neutral',
};

function ModuleContent() {
  const toast = useToast();
  const [tab, setTab] = useState<'titulares' | 'consentimientos'>('consentimientos');
  const [empresas, setEmpresas] = useState<EmpresaRef[] | null>(null);
  const [titulares, setTitulares] = useState<Titular[] | null>(null);
  const [consentimientos, setConsentimientos] = useState<Consentimiento[] | null>(null);
  const [query, setQuery] = useState('');
  const [showTitularModal, setShowTitularModal] = useState(false);
  const [showConsentimientoModal, setShowConsentimientoModal] = useState(false);
  const [nuevoTitular, setNuevoTitular] = useState(emptyTitular);
  const [nuevoConsentimiento, setNuevoConsentimiento] = useState(emptyConsentimiento);
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

  async function cargarTitulares() {
    try {
      const res = await apiFetch<{ data: Titular[] }>('/titulares');
      setTitulares(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar los titulares: ${(err as Error).message}`);
      setTitulares([]);
    }
  }

  async function cargarConsentimientos() {
    try {
      const res = await apiFetch<{ data: Consentimiento[] }>('/consentimientos');
      setConsentimientos(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar los consentimientos: ${(err as Error).message}`);
      setConsentimientos([]);
    }
  }

  useEffect(() => {
    cargarEmpresas();
    cargarTitulares();
    cargarConsentimientos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function abrirCrearTitular() {
    setNuevoTitular({ ...emptyTitular, empresaId: empresas?.length === 1 ? empresas[0].id : '' });
    setShowTitularModal(true);
  }

  function abrirCrearConsentimiento() {
    setNuevoConsentimiento({ ...emptyConsentimiento, empresaId: empresas?.length === 1 ? empresas[0].id : '' });
    setShowConsentimientoModal(true);
  }

  async function crearTitular(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/titulares', { method: 'POST', body: JSON.stringify(omitEmpty(nuevoTitular)) });
      toast.success('Titular registrado');
      setNuevoTitular(emptyTitular);
      setShowTitularModal(false);
      cargarTitulares();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function crearConsentimiento(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/consentimientos', { method: 'POST', body: JSON.stringify(omitEmpty(nuevoConsentimiento)) });
      toast.success('Consentimiento registrado');
      setNuevoConsentimiento(emptyConsentimiento);
      setShowConsentimientoModal(false);
      cargarConsentimientos();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function revocar(id: string) {
    if (!confirm('¿Revocar este consentimiento?')) return;
    try {
      await apiFetch(`/consentimientos/${id}/revocar`, { method: 'POST' });
      toast.success('Consentimiento revocado');
      cargarConsentimientos();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const titularesById = useMemo(() => {
    const map = new Map<string, Titular>();
    (titulares ?? []).forEach((t) => map.set(t.id, t));
    return map;
  }, [titulares]);

  const titularesFiltrados = useMemo(() => {
    if (!titulares) return [];
    const q = query.trim().toLowerCase();
    if (!q) return titulares;
    return titulares.filter((t) => [t.nombre, t.email].some((v) => v?.toLowerCase().includes(q)));
  }, [titulares, query]);

  const consentimientosFiltrados = useMemo(() => {
    if (!consentimientos) return [];
    const q = query.trim().toLowerCase();
    if (!q) return consentimientos;
    return consentimientos.filter((c) => {
      const titularNombre = titularesById.get(c.titularId)?.nombre ?? '';
      return [c.finalidad, c.canal, c.estado, titularNombre].some((v) => v?.toLowerCase().includes(q));
    });
  }, [consentimientos, query, titularesById]);

  return (
    <div className="dpo-module">
      <div className="dpo-module-header">
        <div>
          <h2>Consentimientos</h2>
          <p className="dpo-module-subtitle">Registra titulares de datos y controla sus consentimientos vigentes.</p>
        </div>
        <button
          className="dpo-btn dpo-btn-primary"
          onClick={() => (tab === 'titulares' ? abrirCrearTitular() : abrirCrearConsentimiento())}
        >
          <Icon name="plus" size={16} /> {tab === 'titulares' ? 'Nuevo titular' : 'Nuevo consentimiento'}
        </button>
      </div>

      <div className="dpo-tabs">
        <button className={tab === 'consentimientos' ? 'active' : ''} onClick={() => setTab('consentimientos')}>
          <Icon name="shield" size={15} /> Consentimientos
        </button>
        <button className={tab === 'titulares' ? 'active' : ''} onClick={() => setTab('titulares')}>
          <Icon name="users" size={15} /> Titulares
        </button>
      </div>

      <div className="dpo-toolbar">
        <div className="dpo-search">
          <Icon name="search" size={16} />
          <input placeholder="Buscar…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {tab === 'titulares' &&
        (titulares === null ? (
          <TableSkeleton />
        ) : titularesFiltrados.length === 0 ? (
          <div className="dpo-empty">
            <Icon name="users" size={32} />
            <p className="dpo-empty-title">Sin titulares registrados</p>
            <p>Registra a las personas cuyos datos tratas antes de asociarles consentimientos.</p>
          </div>
        ) : (
          <div className="dpo-table-wrap">
            <table className="dpo-table">
              <thead><tr><th>Nombre</th><th>Cédula</th><th>Email</th></tr></thead>
              <tbody>
                {titularesFiltrados.map((t) => (
                  <tr key={t.id}>
                    <td><strong>{t.nombre}</strong></td>
                    <td>{t.documentoIdentidad || '—'}</td>
                    <td>{t.email || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {tab === 'consentimientos' &&
        (consentimientos === null ? (
          <TableSkeleton />
        ) : consentimientosFiltrados.length === 0 ? (
          <div className="dpo-empty">
            <Icon name="shield" size={32} />
            <p className="dpo-empty-title">Sin consentimientos registrados</p>
            <p>Registra un titular y luego su primer consentimiento.</p>
          </div>
        ) : (
          <div className="dpo-table-wrap">
            <table className="dpo-table">
              <thead>
                <tr><th>Titular</th><th>Finalidad</th><th>Canal</th><th>Estado</th><th>Fecha</th><th></th></tr>
              </thead>
              <tbody>
                {consentimientosFiltrados.map((c) => (
                  <tr key={c.id}>
                    <td>{titularesById.get(c.titularId)?.nombre ?? '—'}</td>
                    <td>{c.finalidad}</td>
                    <td>{c.canal}</td>
                    <td><span className={`dpo-badge ${estadoBadge[c.estado] ?? 'dpo-badge-neutral'}`}>{c.estado}</span></td>
                    <td className="dpo-muted">{new Date(c.fechaOtorgamiento).toLocaleDateString()}</td>
                    <td className="dpo-table-actions">
                      {c.estado === 'otorgado' && (
                        <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => revocar(c.id)}>Revocar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {showTitularModal && (
        <Modal title="Nuevo titular" onClose={() => setShowTitularModal(false)}>
          <form className="dpo-form" onSubmit={crearTitular}>
            {(empresas?.length ?? 0) > 1 && (
              <div className="dpo-field">
                <label>Empresa *</label>
                <select value={nuevoTitular.empresaId} onChange={(e) => setNuevoTitular({ ...nuevoTitular, empresaId: e.target.value })} required>
                  <option value="">Selecciona una empresa</option>
                  {(empresas ?? []).map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
            )}
            <div className="dpo-field">
              <label>Nombres *</label>
              <input value={nuevoTitular.nombre} onChange={(e) => setNuevoTitular({ ...nuevoTitular, nombre: e.target.value })} required />
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Cédula</label>
                <input value={nuevoTitular.documentoIdentidad} onChange={(e) => setNuevoTitular({ ...nuevoTitular, documentoIdentidad: e.target.value })} />
              </div>
              <div className="dpo-field">
                <label>Correo</label>
                <input type="email" value={nuevoTitular.email} onChange={(e) => setNuevoTitular({ ...nuevoTitular, email: e.target.value })} />
              </div>
            </div>
            <div className="dpo-form-actions">
              <button type="button" className="dpo-btn dpo-btn-secondary" onClick={() => setShowTitularModal(false)}>Cancelar</button>
              <button type="submit" className="dpo-btn dpo-btn-primary" disabled={saving}>{saving && <span className="dpo-spinner" />} Registrar</button>
            </div>
          </form>
        </Modal>
      )}

      {showConsentimientoModal && (
        <Modal title="Nuevo consentimiento" onClose={() => setShowConsentimientoModal(false)}>
          <form className="dpo-form" onSubmit={crearConsentimiento}>
            {(empresas?.length ?? 0) > 1 && (
              <div className="dpo-field">
                <label>Empresa *</label>
                <select value={nuevoConsentimiento.empresaId} onChange={(e) => setNuevoConsentimiento({ ...nuevoConsentimiento, empresaId: e.target.value })} required>
                  <option value="">Selecciona una empresa</option>
                  {(empresas ?? []).map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
            )}
            <div className="dpo-field">
              <label>Titular *</label>
              <select value={nuevoConsentimiento.titularId} onChange={(e) => setNuevoConsentimiento({ ...nuevoConsentimiento, titularId: e.target.value })} required>
                <option value="">Selecciona un titular</option>
                {(titulares ?? []).map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>
            <div className="dpo-field">
              <label>Finalidad *</label>
              <input value={nuevoConsentimiento.finalidad} onChange={(e) => setNuevoConsentimiento({ ...nuevoConsentimiento, finalidad: e.target.value })} required />
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Base legal</label>
                <input value={nuevoConsentimiento.baseLegal} onChange={(e) => setNuevoConsentimiento({ ...nuevoConsentimiento, baseLegal: e.target.value })} />
              </div>
              <div className="dpo-field">
                <label>Canal</label>
                <select value={nuevoConsentimiento.canal} onChange={(e) => setNuevoConsentimiento({ ...nuevoConsentimiento, canal: e.target.value })}>
                  <option value="web">Web</option>
                  <option value="app">App</option>
                  <option value="papel">Papel</option>
                  <option value="telefono">Teléfono</option>
                  <option value="email">Email</option>
                  <option value="presencial">Presencial</option>
                </select>
              </div>
            </div>
            <div className="dpo-form-actions">
              <button type="button" className="dpo-btn dpo-btn-secondary" onClick={() => setShowConsentimientoModal(false)}>Cancelar</button>
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
