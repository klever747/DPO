import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch, omitEmpty } from './lib/api';
import { Icon } from './ui/Icon';
import { Modal } from './ui/Modal';
import { TableSkeleton } from './ui/Skeleton';
import { ToastProvider, useToast } from './ui/Toast';
import './styles.css';

interface Auditoria {
  id: string;
  tipo: string;
  alcance?: string;
  auditor?: string;
  estado: string;
  fechaInicio?: string;
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

const TIPOS = ['interna', 'externa', 'seguimiento'];
const ESTADOS = ['planificada', 'en_curso', 'finalizada'];
const emptyForm = { tipo: 'interna', alcance: '', auditor: '', fechaInicio: '' };

const estadoBadge: Record<string, string> = {
  planificada: 'dpo-badge-neutral',
  en_curso: 'dpo-badge-warning',
  finalizada: 'dpo-badge-success',
};

function ModuleContent() {
  const toast = useToast();
  const [items, setItems] = useState<Auditoria[] | null>(null);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function cargar() {
    try {
      const res = await apiFetch<{ data: Auditoria[] }>('/auditorias');
      setItems(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar las auditorías: ${(err as Error).message}`);
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
      await apiFetch('/auditorias', { method: 'POST', body: JSON.stringify(omitEmpty({ ...form, empresaId, fechaInicio: form.fechaInicio || undefined })) });
      toast.success('Auditoría registrada');
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
      await apiFetch(`/auditorias/${id}`, { method: 'PATCH', body: JSON.stringify({ estado }) });
      toast.success('Estado actualizado');
      cargar();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar esta auditoría?')) return;
    try {
      await apiFetch(`/auditorias/${id}`, { method: 'DELETE' });
      toast.success('Auditoría eliminada');
      cargar();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const filtrados = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => [i.tipo, i.alcance, i.auditor, i.estado].some((v) => v?.toLowerCase().includes(q)));
  }, [items, query]);

  return (
    <div className="dpo-module">
      <div className="dpo-module-header">
        <div>
          <h2>Auditoría</h2>
          <p className="dpo-module-subtitle">Planifica auditorías internas y externas de cumplimiento en protección de datos.</p>
        </div>
        <button className="dpo-btn dpo-btn-primary" onClick={() => setShowModal(true)}>
          <Icon name="plus" size={16} /> Nueva auditoría
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
              {filtrados.map((a) => (
                <tr key={a.id}>
                  <td><span className="dpo-badge dpo-badge-neutral">{a.tipo}</span></td>
                  <td>{a.alcance || '—'}</td>
                  <td>{a.auditor || '—'}</td>
                  <td>
                    <select value={a.estado} onChange={(e) => cambiarEstado(a.id, e.target.value)} style={{ border: 'none', background: 'transparent', fontWeight: 600, cursor: 'pointer' }}>
                      {ESTADOS.map((es) => <option key={es} value={es}>{es}</option>)}
                    </select>
                  </td>
                  <td className="dpo-muted">{a.fechaInicio ? new Date(a.fechaInicio).toLocaleDateString() : '—'}</td>
                  <td className="dpo-table-actions">
                    <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => eliminar(a.id)} title="Eliminar">
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
        <Modal title="Nueva auditoría" onClose={() => setShowModal(false)}>
          <form className="dpo-form" onSubmit={crear}>
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
