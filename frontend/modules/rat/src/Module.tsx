import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch } from './lib/api';
import { Icon } from './ui/Icon';
import { Modal } from './ui/Modal';
import { TableSkeleton } from './ui/Skeleton';
import { ToastProvider, useToast } from './ui/Toast';
import './styles.css';

interface Actividad {
  id: string;
  nombreActividad: string;
  finalidad: string;
  baseLegal: string;
  estado: string;
  categoriasDatos: string[];
  destinatarios: string[];
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

const emptyForm = { nombreActividad: '', finalidad: '', baseLegal: '', categoriasDatos: '', destinatarios: '' };

const estadoBadge: Record<string, string> = {
  vigente: 'dpo-badge-success',
  borrador: 'dpo-badge-warning',
  obsoleto: 'dpo-badge-neutral',
};

function ModuleContent() {
  const toast = useToast();
  const [actividades, setActividades] = useState<Actividad[] | null>(null);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function cargar() {
    try {
      const res = await apiFetch<{ data: Actividad[] }>('/actividades');
      setActividades(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar las actividades: ${(err as Error).message}`);
      setActividades([]);
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
      await apiFetch('/actividades', {
        method: 'POST',
        body: JSON.stringify({
          empresaId,
          nombreActividad: form.nombreActividad,
          finalidad: form.finalidad,
          baseLegal: form.baseLegal,
          categoriasDatos: form.categoriasDatos.split(',').map((s) => s.trim()).filter(Boolean),
          destinatarios: form.destinatarios.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      toast.success(`Actividad "${form.nombreActividad}" registrada`);
      setForm(emptyForm);
      setShowModal(false);
      cargar();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function eliminar(id: string, nombre: string) {
    if (!confirm(`¿Eliminar la actividad "${nombre}"?`)) return;
    try {
      await apiFetch(`/actividades/${id}`, { method: 'DELETE' });
      toast.success('Actividad eliminada');
      cargar();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const filtradas = useMemo(() => {
    if (!actividades) return [];
    const q = query.trim().toLowerCase();
    if (!q) return actividades;
    return actividades.filter((a) => [a.nombreActividad, a.finalidad, a.baseLegal].some((v) => v?.toLowerCase().includes(q)));
  }, [actividades, query]);

  return (
    <div className="dpo-module">
      <div className="dpo-module-header">
        <div>
          <h2>Registro de Actividades de Tratamiento (RAT)</h2>
          <p className="dpo-module-subtitle">Documenta cada actividad de tratamiento de datos personales de la organización.</p>
        </div>
        <button className="dpo-btn dpo-btn-primary" onClick={() => setShowModal(true)}>
          <Icon name="plus" size={16} /> Nueva actividad
        </button>
      </div>

      <div className="dpo-toolbar">
        <div className="dpo-search">
          <Icon name="search" size={16} />
          <input placeholder="Buscar…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {actividades === null ? (
        <TableSkeleton />
      ) : filtradas.length === 0 ? (
        <div className="dpo-empty">
          <Icon name="clipboard" size={32} />
          <p className="dpo-empty-title">Sin actividades registradas</p>
          <p>Registra tu primera actividad de tratamiento para empezar el RAT.</p>
        </div>
      ) : (
        <div className="dpo-table-wrap">
          <table className="dpo-table">
            <thead>
              <tr><th>Actividad</th><th>Finalidad</th><th>Base legal</th><th>Categorías de datos</th><th>Destinatarios</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {filtradas.map((a) => (
                <tr key={a.id}>
                  <td><strong>{a.nombreActividad}</strong></td>
                  <td>{a.finalidad}</td>
                  <td>{a.baseLegal}</td>
                  <td>{a.categoriasDatos?.join(', ') || '—'}</td>
                  <td>{a.destinatarios?.join(', ') || '—'}</td>
                  <td><span className={`dpo-badge ${estadoBadge[a.estado] ?? 'dpo-badge-neutral'}`}>{a.estado}</span></td>
                  <td className="dpo-table-actions">
                    <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => eliminar(a.id, a.nombreActividad)} title="Eliminar">
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
        <Modal title="Nueva actividad de tratamiento" onClose={() => setShowModal(false)}>
          <form className="dpo-form" onSubmit={crear}>
            <div className="dpo-field">
              <label>Nombre de la actividad *</label>
              <input value={form.nombreActividad} onChange={(e) => setForm({ ...form, nombreActividad: e.target.value })} required />
            </div>
            <div className="dpo-field">
              <label>Finalidad *</label>
              <textarea value={form.finalidad} onChange={(e) => setForm({ ...form, finalidad: e.target.value })} required />
            </div>
            <div className="dpo-field">
              <label>Base legal *</label>
              <input value={form.baseLegal} onChange={(e) => setForm({ ...form, baseLegal: e.target.value })} required />
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Categorías de datos (separadas por coma)</label>
                <input value={form.categoriasDatos} onChange={(e) => setForm({ ...form, categoriasDatos: e.target.value })} placeholder="identificativos, bancarios" />
              </div>
              <div className="dpo-field">
                <label>Destinatarios (separados por coma)</label>
                <input value={form.destinatarios} onChange={(e) => setForm({ ...form, destinatarios: e.target.value })} placeholder="entidad bancaria" />
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
