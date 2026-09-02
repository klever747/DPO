import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch, omitEmpty } from './lib/api';
import { Icon } from './ui/Icon';
import { Modal } from './ui/Modal';
import { TableSkeleton } from './ui/Skeleton';
import { ToastProvider, useToast } from './ui/Toast';
import './styles.css';

interface Dominio {
  dominio: string;
  nivel: number;
}

interface Evaluacion {
  id: string;
  fechaEvaluacion: string;
  modelo: string;
  evaluador?: string;
  nivelGlobal?: number;
  dominios: Dominio[];
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

const emptyForm = { fechaEvaluacion: new Date().toISOString().slice(0, 10), evaluador: '', observaciones: '' };

function ModuleContent() {
  const toast = useToast();
  const [items, setItems] = useState<Evaluacion[] | null>(null);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [dominios, setDominios] = useState<Dominio[]>([{ dominio: 'Gobernanza', nivel: 1 }]);
  const [saving, setSaving] = useState(false);

  async function cargar() {
    try {
      const res = await apiFetch<{ data: Evaluacion[] }>('/evaluaciones-madurez');
      setItems(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar las evaluaciones: ${(err as Error).message}`);
      setItems([]);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function actualizarDominio(idx: number, campo: keyof Dominio, valor: string | number) {
    setDominios((prev) => prev.map((d, i) => (i === idx ? { ...d, [campo]: valor } : d)));
  }

  async function crear(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const empresaId = getEmpresaIdFromToken();
      const promedio = dominios.length ? Math.round((dominios.reduce((sum, d) => sum + Number(d.nivel), 0) / dominios.length) * 10) / 10 : undefined;
      await apiFetch('/evaluaciones-madurez', {
        method: 'POST',
        body: JSON.stringify(omitEmpty({ ...form, empresaId, nivelGlobal: promedio, dominios: dominios.filter((d) => d.dominio.trim()) })),
      });
      toast.success('Evaluación de madurez registrada');
      setForm(emptyForm);
      setDominios([{ dominio: 'Gobernanza', nivel: 1 }]);
      setShowModal(false);
      cargar();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar esta evaluación de madurez?')) return;
    try {
      await apiFetch(`/evaluaciones-madurez/${id}`, { method: 'DELETE' });
      toast.success('Evaluación eliminada');
      cargar();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const filtrados = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => [i.modelo, i.evaluador].some((v) => v?.toLowerCase().includes(q)));
  }, [items, query]);

  return (
    <div className="dpo-module">
      <div className="dpo-module-header">
        <div>
          <h2>Madurez</h2>
          <p className="dpo-module-subtitle">Evalúa el nivel de madurez de protección de datos de la organización por dominios.</p>
        </div>
        <button className="dpo-btn dpo-btn-primary" onClick={() => setShowModal(true)}>
          <Icon name="plus" size={16} /> Nueva evaluación
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
          <Icon name="bar-chart" size={32} />
          <p className="dpo-empty-title">Sin evaluaciones registradas</p>
          <p>Realiza la primera evaluación de madurez de protección de datos.</p>
        </div>
      ) : (
        <div className="dpo-table-wrap">
          <table className="dpo-table">
            <thead>
              <tr><th>Fecha</th><th>Modelo</th><th>Evaluador</th><th>Nivel global</th><th>Dominios</th><th></th></tr>
            </thead>
            <tbody>
              {filtrados.map((ev) => (
                <tr key={ev.id}>
                  <td className="dpo-muted">{new Date(ev.fechaEvaluacion).toLocaleDateString()}</td>
                  <td>{ev.modelo}</td>
                  <td>{ev.evaluador || '—'}</td>
                  <td><span className="dpo-badge dpo-badge-primary">{ev.nivelGlobal ?? '—'} / 5</span></td>
                  <td className="dpo-muted">{ev.dominios?.map((d) => `${d.dominio} (${d.nivel})`).join(', ') || '—'}</td>
                  <td className="dpo-table-actions">
                    <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => eliminar(ev.id)} title="Eliminar">
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
        <Modal title="Nueva evaluación de madurez" onClose={() => setShowModal(false)}>
          <form className="dpo-form" onSubmit={crear}>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Fecha de evaluación *</label>
                <input type="date" value={form.fechaEvaluacion} onChange={(e) => setForm({ ...form, fechaEvaluacion: e.target.value })} required />
              </div>
              <div className="dpo-field">
                <label>Evaluador</label>
                <input value={form.evaluador} onChange={(e) => setForm({ ...form, evaluador: e.target.value })} />
              </div>
            </div>

            <div className="dpo-field">
              <label>Dominios evaluados (nivel 1 a 5)</label>
              {dominios.map((d, idx) => (
                <div key={idx} className="dpo-form-row" style={{ marginBottom: 6 }}>
                  <input
                    style={{ flex: 2, padding: '8px 10px', border: '1px solid var(--dpo-border)', borderRadius: 8 }}
                    value={d.dominio}
                    onChange={(e) => actualizarDominio(idx, 'dominio', e.target.value)}
                    placeholder="Ej: Gobernanza, Técnico, Formación…"
                  />
                  <select
                    style={{ flex: 1, padding: '8px 10px', border: '1px solid var(--dpo-border)', borderRadius: 8 }}
                    value={d.nivel}
                    onChange={(e) => actualizarDominio(idx, 'nivel', Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>Nivel {n}</option>)}
                  </select>
                  <button type="button" className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => setDominios((prev) => prev.filter((_, i) => i !== idx))}>
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              ))}
              <button type="button" className="dpo-btn dpo-btn-secondary dpo-btn-sm" onClick={() => setDominios((prev) => [...prev, { dominio: '', nivel: 1 }])}>
                <Icon name="plus" size={14} /> Añadir dominio
              </button>
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
