import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch, omitEmpty } from './lib/api';
import { Icon } from './ui/Icon';
import { Modal } from './ui/Modal';
import { TableSkeleton } from './ui/Skeleton';
import { ToastProvider, useToast } from './ui/Toast';
import './styles.css';

interface Formacion {
  id: string;
  titulo: string;
  descripcion?: string;
  tipo: string;
  fechaInicio?: string;
  fechaFin?: string;
  duracionHoras?: number;
  obligatoria: boolean;
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

const TIPOS = ['presencial', 'online', 'elearning'];
const emptyForm = { titulo: '', descripcion: '', tipo: 'elearning', fechaInicio: '', fechaFin: '', duracionHoras: '', obligatoria: false };

function ModuleContent() {
  const toast = useToast();
  const [items, setItems] = useState<Formacion[] | null>(null);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function cargar() {
    try {
      const res = await apiFetch<{ data: Formacion[] }>('/formaciones');
      setItems(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar las formaciones: ${(err as Error).message}`);
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
      await apiFetch('/formaciones', {
        method: 'POST',
        body: JSON.stringify(omitEmpty({
          ...form,
          empresaId,
          duracionHoras: form.duracionHoras ? Number(form.duracionHoras) : undefined,
          fechaInicio: form.fechaInicio || undefined,
          fechaFin: form.fechaFin || undefined,
        })),
      });
      toast.success(`Formación "${form.titulo}" registrada`);
      setForm(emptyForm);
      setShowModal(false);
      cargar();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function eliminar(id: string, titulo: string) {
    if (!confirm(`¿Eliminar la formación "${titulo}"?`)) return;
    try {
      await apiFetch(`/formaciones/${id}`, { method: 'DELETE' });
      toast.success('Formación eliminada');
      cargar();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const filtrados = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => [i.titulo, i.tipo].some((v) => v?.toLowerCase().includes(q)));
  }, [items, query]);

  return (
    <div className="dpo-module">
      <div className="dpo-module-header">
        <div>
          <h2>Formación</h2>
          <p className="dpo-module-subtitle">Planifica y da seguimiento a la formación en protección de datos del personal.</p>
        </div>
        <button className="dpo-btn dpo-btn-primary" onClick={() => setShowModal(true)}>
          <Icon name="plus" size={16} /> Nueva formación
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
          <Icon name="book" size={32} />
          <p className="dpo-empty-title">Sin formaciones registradas</p>
          <p>Crea el primer curso o sesión de formación.</p>
        </div>
      ) : (
        <div className="dpo-table-wrap">
          <table className="dpo-table">
            <thead>
              <tr><th>Título</th><th>Tipo</th><th>Duración</th><th>Obligatoria</th><th>Inicio</th><th></th></tr>
            </thead>
            <tbody>
              {filtrados.map((f) => (
                <tr key={f.id}>
                  <td><strong>{f.titulo}</strong></td>
                  <td><span className="dpo-badge dpo-badge-neutral">{f.tipo}</span></td>
                  <td>{f.duracionHoras ? `${f.duracionHoras} h` : '—'}</td>
                  <td>
                    <span className={`dpo-badge ${f.obligatoria ? 'dpo-badge-warning' : 'dpo-badge-neutral'}`}>{f.obligatoria ? 'Sí' : 'No'}</span>
                  </td>
                  <td className="dpo-muted">{f.fechaInicio ? new Date(f.fechaInicio).toLocaleDateString() : '—'}</td>
                  <td className="dpo-table-actions">
                    <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => eliminar(f.id, f.titulo)} title="Eliminar">
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
        <Modal title="Nueva formación" onClose={() => setShowModal(false)}>
          <form className="dpo-form" onSubmit={crear}>
            <div className="dpo-field">
              <label>Título *</label>
              <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
            </div>
            <div className="dpo-field">
              <label>Descripción</label>
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Tipo</label>
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="dpo-field">
                <label>Duración (horas)</label>
                <input type="number" min={0} step={0.5} value={form.duracionHoras} onChange={(e) => setForm({ ...form, duracionHoras: e.target.value })} />
              </div>
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Fecha de inicio</label>
                <input type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} />
              </div>
              <div className="dpo-field">
                <label>Fecha de fin</label>
                <input type="date" value={form.fechaFin} onChange={(e) => setForm({ ...form, fechaFin: e.target.value })} />
              </div>
            </div>
            <div className="dpo-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="obligatoria" checked={form.obligatoria} onChange={(e) => setForm({ ...form, obligatoria: e.target.checked })} style={{ width: 'auto' }} />
              <label htmlFor="obligatoria" style={{ margin: 0 }}>Formación obligatoria</label>
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
