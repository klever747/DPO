import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch, omitEmpty } from './lib/api';
import { Icon } from './ui/Icon';
import { Modal } from './ui/Modal';
import { TableSkeleton } from './ui/Skeleton';
import { ToastProvider, useToast } from './ui/Toast';
import './styles.css';

interface Politica {
  id: string;
  categoriaDatos: string;
  baseLegalRetencion?: string;
  plazoValor: number;
  plazoUnidad: string;
  accionAlVencer: string;
  activo: boolean;
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

const UNIDADES = ['dias', 'meses', 'anios'];
const ACCIONES = ['eliminacion', 'anonimizacion', 'archivado'];
const emptyForm = { categoriaDatos: '', baseLegalRetencion: '', plazoValor: '5', plazoUnidad: 'anios', criterioInicioComputo: '', accionAlVencer: 'eliminacion' };

function ModuleContent() {
  const toast = useToast();
  const [items, setItems] = useState<Politica[] | null>(null);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function cargar() {
    try {
      const res = await apiFetch<{ data: Politica[] }>('/politicas-retencion');
      setItems(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar las políticas: ${(err as Error).message}`);
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
      await apiFetch('/politicas-retencion', {
        method: 'POST',
        body: JSON.stringify(omitEmpty({ ...form, empresaId, plazoValor: Number(form.plazoValor) })),
      });
      toast.success('Política de retención registrada');
      setForm(emptyForm);
      setShowModal(false);
      cargar();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function eliminar(id: string, categoria: string) {
    if (!confirm(`¿Eliminar la política de "${categoria}"?`)) return;
    try {
      await apiFetch(`/politicas-retencion/${id}`, { method: 'DELETE' });
      toast.success('Política eliminada');
      cargar();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const filtrados = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => [i.categoriaDatos, i.accionAlVencer].some((v) => v?.toLowerCase().includes(q)));
  }, [items, query]);

  return (
    <div className="dpo-module">
      <div className="dpo-module-header">
        <div>
          <h2>Plazos de Retención</h2>
          <p className="dpo-module-subtitle">Define cuánto tiempo se conservan las distintas categorías de datos y qué ocurre al vencer.</p>
        </div>
        <button className="dpo-btn dpo-btn-primary" onClick={() => setShowModal(true)}>
          <Icon name="plus" size={16} /> Nueva política
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
          <Icon name="clock" size={32} />
          <p className="dpo-empty-title">Sin políticas registradas</p>
          <p>Define tu primera política de retención de datos.</p>
        </div>
      ) : (
        <div className="dpo-table-wrap">
          <table className="dpo-table">
            <thead>
              <tr><th>Categoría de datos</th><th>Base legal</th><th>Plazo</th><th>Al vencer</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.categoriaDatos}</strong></td>
                  <td>{p.baseLegalRetencion || '—'}</td>
                  <td>{p.plazoValor} {p.plazoUnidad}</td>
                  <td><span className="dpo-badge dpo-badge-neutral">{p.accionAlVencer}</span></td>
                  <td><span className={`dpo-badge ${p.activo ? 'dpo-badge-success' : 'dpo-badge-neutral'}`}>{p.activo ? 'Activa' : 'Inactiva'}</span></td>
                  <td className="dpo-table-actions">
                    <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => eliminar(p.id, p.categoriaDatos)} title="Eliminar">
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
        <Modal title="Nueva política de retención" onClose={() => setShowModal(false)}>
          <form className="dpo-form" onSubmit={crear}>
            <div className="dpo-field">
              <label>Categoría de datos *</label>
              <input value={form.categoriaDatos} onChange={(e) => setForm({ ...form, categoriaDatos: e.target.value })} placeholder="Nómina, historiales clínicos…" required />
            </div>
            <div className="dpo-field">
              <label>Base legal de retención</label>
              <input value={form.baseLegalRetencion} onChange={(e) => setForm({ ...form, baseLegalRetencion: e.target.value })} />
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Plazo *</label>
                <input type="number" min={1} value={form.plazoValor} onChange={(e) => setForm({ ...form, plazoValor: e.target.value })} required />
              </div>
              <div className="dpo-field">
                <label>Unidad</label>
                <select value={form.plazoUnidad} onChange={(e) => setForm({ ...form, plazoUnidad: e.target.value })}>
                  {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="dpo-field">
              <label>Criterio de inicio del cómputo</label>
              <input value={form.criterioInicioComputo} onChange={(e) => setForm({ ...form, criterioInicioComputo: e.target.value })} placeholder="Fin de la relación contractual…" />
            </div>
            <div className="dpo-field">
              <label>Acción al vencer</label>
              <select value={form.accionAlVencer} onChange={(e) => setForm({ ...form, accionAlVencer: e.target.value })}>
                {ACCIONES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
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
