import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch, omitEmpty } from './lib/api';
import { Icon } from './ui/Icon';
import { Modal } from './ui/Modal';
import { TableSkeleton } from './ui/Skeleton';
import { ToastProvider, useToast } from './ui/Toast';
import './styles.css';

interface Solicitud {
  id: string;
  titularNombre: string;
  titularEmail?: string;
  tipoDerecho: string;
  estado: string;
  fechaSolicitud: string;
  fechaLimite?: string;
  descripcion?: string;
}

function getEmpresaIdFromToken(): string | null {
  const token = localStorage.getItem('dpo_token');
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1])).empresaId ?? null;
  } catch {
    return null;
  }
}

const TIPOS = ['acceso', 'rectificacion', 'cancelacion', 'oposicion', 'portabilidad', 'limitacion'];
const emptyForm = { titularNombre: '', titularEmail: '', tipoDerecho: 'acceso', descripcion: '', canalRecepcion: '' };

const estadoBadge: Record<string, string> = {
  recibida: 'dpo-badge-warning',
  en_proceso: 'dpo-badge-primary',
  resuelta: 'dpo-badge-success',
  rechazada: 'dpo-badge-danger',
};

function ModuleContent() {
  const toast = useToast();
  const [items, setItems] = useState<Solicitud[] | null>(null);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function cargar() {
    try {
      const res = await apiFetch<{ data: Solicitud[] }>('/solicitudes-arco');
      setItems(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar las solicitudes: ${(err as Error).message}`);
      setItems([]);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function crear(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const empresaId = getEmpresaIdFromToken();
      await apiFetch('/solicitudes-arco', { method: 'POST', body: JSON.stringify(omitEmpty({ ...form, empresaId })) });
      toast.success('Solicitud ARCO registrada');
      setForm(emptyForm);
      setShowModal(false);
      cargar();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function cambiarEstado(id: string, estado: string) {
    try {
      await apiFetch(`/solicitudes-arco/${id}`, { method: 'PATCH', body: JSON.stringify({ estado }) });
      toast.success('Estado actualizado');
      cargar();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function eliminar(id: string, nombre: string) {
    if (!confirm(`¿Eliminar la solicitud de "${nombre}"?`)) return;
    try {
      await apiFetch(`/solicitudes-arco/${id}`, { method: 'DELETE' });
      toast.success('Solicitud eliminada');
      cargar();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const filtrados = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => [i.titularNombre, i.tipoDerecho, i.estado].some((v) => v?.toLowerCase().includes(q)));
  }, [items, query]);

  return (
    <div className="dpo-module">
      <div className="dpo-module-header">
        <div>
          <h2>Derechos ARCO</h2>
          <p className="dpo-module-subtitle">Gestiona solicitudes de Acceso, Rectificación, Cancelación, Oposición, Portabilidad y Limitación.</p>
        </div>
        <button className="dpo-btn dpo-btn-primary" onClick={() => setShowModal(true)}>
          <Icon name="plus" size={16} /> Nueva solicitud
        </button>
      </div>

      <div className="dpo-toolbar">
        <div className="dpo-search">
          <Icon name="search" size={16} />
          <input placeholder="Buscar…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {items === null ? (
        <TableSkeleton />
      ) : filtrados.length === 0 ? (
        <div className="dpo-empty">
          <Icon name="user-check" size={32} />
          <p className="dpo-empty-title">Sin solicitudes registradas</p>
          <p>Registra una solicitud de derechos ARCO para empezar a darle seguimiento.</p>
        </div>
      ) : (
        <div className="dpo-table-wrap">
          <table className="dpo-table">
            <thead>
              <tr><th>Titular</th><th>Tipo</th><th>Estado</th><th>Fecha solicitud</th><th>Fecha límite</th><th></th></tr>
            </thead>
            <tbody>
              {filtrados.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.titularNombre}</strong>{s.titularEmail && <div className="dpo-muted">{s.titularEmail}</div>}</td>
                  <td><span className="dpo-badge dpo-badge-neutral">{s.tipoDerecho}</span></td>
                  <td>
                    <select
                      className="dpo-badge-select"
                      value={s.estado}
                      onChange={(e) => cambiarEstado(s.id, e.target.value)}
                      style={{ border: 'none', background: 'transparent', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {Object.keys(estadoBadge).map((es) => <option key={es} value={es}>{es}</option>)}
                    </select>
                  </td>
                  <td className="dpo-muted">{new Date(s.fechaSolicitud).toLocaleDateString()}</td>
                  <td className="dpo-muted">{s.fechaLimite ? new Date(s.fechaLimite).toLocaleDateString() : '—'}</td>
                  <td className="dpo-table-actions">
                    <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => eliminar(s.id, s.titularNombre)} title="Eliminar">
                      <Icon name="trash" size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title="Nueva solicitud ARCO" onClose={() => setShowModal(false)}>
          <form className="dpo-form" onSubmit={crear}>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Nombre del titular *</label>
                <input value={form.titularNombre} onChange={(e) => setForm({ ...form, titularNombre: e.target.value })} required />
              </div>
              <div className="dpo-field">
                <label>Email del titular</label>
                <input type="email" value={form.titularEmail} onChange={(e) => setForm({ ...form, titularEmail: e.target.value })} />
              </div>
            </div>
            <div className="dpo-field">
              <label>Tipo de derecho *</label>
              <select value={form.tipoDerecho} onChange={(e) => setForm({ ...form, tipoDerecho: e.target.value })}>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="dpo-field">
              <label>Descripción</label>
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            </div>
            <div className="dpo-field">
              <label>Canal de recepción</label>
              <input value={form.canalRecepcion} onChange={(e) => setForm({ ...form, canalRecepcion: e.target.value })} placeholder="email, formulario web, presencial…" />
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
