import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch, omitEmpty } from './lib/api';
import { Icon } from './ui/Icon';
import { Modal } from './ui/Modal';
import { TableSkeleton } from './ui/Skeleton';
import { ToastProvider, useToast } from './ui/Toast';
import './styles.css';

interface Brecha {
  id: string;
  titulo: string;
  descripcion: string;
  nivelRiesgo: string;
  estado: string;
  fechaDeteccion: string;
  numAfectados?: number;
  notificadaAutoridad: boolean;
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

const NIVELES = ['bajo', 'medio', 'alto', 'critico'];
const ESTADOS = ['abierta', 'en_investigacion', 'contenida', 'cerrada'];
const emptyForm = { titulo: '', descripcion: '', nivelRiesgo: 'medio', numAfectados: '', fechaDeteccion: new Date().toISOString().slice(0, 10) };

const nivelBadge: Record<string, string> = {
  bajo: 'dpo-badge-success',
  medio: 'dpo-badge-warning',
  alto: 'dpo-badge-danger',
  critico: 'dpo-badge-danger',
};

function ModuleContent() {
  const toast = useToast();
  const [items, setItems] = useState<Brecha[] | null>(null);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function cargar() {
    try {
      const res = await apiFetch<{ data: Brecha[] }>('/brechas');
      setItems(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar las brechas: ${(err as Error).message}`);
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
      await apiFetch('/brechas', {
        method: 'POST',
        body: JSON.stringify(omitEmpty({
          ...form,
          empresaId,
          numAfectados: form.numAfectados ? Number(form.numAfectados) : undefined,
          fechaDeteccion: new Date(form.fechaDeteccion).toISOString(),
        })),
      });
      toast.success('Brecha de seguridad registrada');
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
      await apiFetch(`/brechas/${id}`, { method: 'PATCH', body: JSON.stringify({ estado }) });
      toast.success('Estado actualizado');
      cargar();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function eliminar(id: string, titulo: string) {
    if (!confirm(`¿Eliminar la brecha "${titulo}"?`)) return;
    try {
      await apiFetch(`/brechas/${id}`, { method: 'DELETE' });
      toast.success('Brecha eliminada');
      cargar();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const filtrados = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => [i.titulo, i.nivelRiesgo, i.estado].some((v) => v?.toLowerCase().includes(q)));
  }, [items, query]);

  return (
    <div className="dpo-module">
      <div className="dpo-module-header">
        <div>
          <h2>Brechas de Seguridad</h2>
          <p className="dpo-module-subtitle">Registra, evalúa el riesgo y da seguimiento a incidentes de seguridad de datos.</p>
        </div>
        <button className="dpo-btn dpo-btn-primary" onClick={() => setShowModal(true)}>
          <Icon name="plus" size={16} /> Nueva brecha
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
          <Icon name="alert-triangle" size={32} />
          <p className="dpo-empty-title">Sin brechas registradas</p>
          <p>Registra un incidente de seguridad para iniciar su seguimiento.</p>
        </div>
      ) : (
        <div className="dpo-table-wrap">
          <table className="dpo-table">
            <thead>
              <tr><th>Título</th><th>Riesgo</th><th>Afectados</th><th>Estado</th><th>Detección</th><th></th></tr>
            </thead>
            <tbody>
              {filtrados.map((b) => (
                <tr key={b.id}>
                  <td><strong>{b.titulo}</strong></td>
                  <td><span className={`dpo-badge ${nivelBadge[b.nivelRiesgo] ?? 'dpo-badge-neutral'}`}>{b.nivelRiesgo}</span></td>
                  <td>{b.numAfectados ?? '—'}</td>
                  <td>
                    <select value={b.estado} onChange={(e) => cambiarEstado(b.id, e.target.value)} style={{ border: 'none', background: 'transparent', fontWeight: 600, cursor: 'pointer' }}>
                      {ESTADOS.map((es) => <option key={es} value={es}>{es}</option>)}
                    </select>
                  </td>
                  <td className="dpo-muted">{new Date(b.fechaDeteccion).toLocaleDateString()}</td>
                  <td className="dpo-table-actions">
                    <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => eliminar(b.id, b.titulo)} title="Eliminar">
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
        <Modal title="Nueva brecha de seguridad" onClose={() => setShowModal(false)}>
          <form className="dpo-form" onSubmit={crear}>
            <div className="dpo-field">
              <label>Título *</label>
              <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
            </div>
            <div className="dpo-field">
              <label>Descripción *</label>
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required />
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Nivel de riesgo</label>
                <select value={form.nivelRiesgo} onChange={(e) => setForm({ ...form, nivelRiesgo: e.target.value })}>
                  {NIVELES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="dpo-field">
                <label>Nº de afectados</label>
                <input type="number" min={0} value={form.numAfectados} onChange={(e) => setForm({ ...form, numAfectados: e.target.value })} />
              </div>
            </div>
            <div className="dpo-field">
              <label>Fecha de detección *</label>
              <input type="date" value={form.fechaDeteccion} onChange={(e) => setForm({ ...form, fechaDeteccion: e.target.value })} required />
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
