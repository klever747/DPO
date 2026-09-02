import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch, omitEmpty } from './lib/api';
import { Icon } from './ui/Icon';
import { Modal } from './ui/Modal';
import { TableSkeleton } from './ui/Skeleton';
import { ToastProvider, useToast } from './ui/Toast';
import './styles.css';

interface Plantilla {
  id: string;
  nombre: string;
  tipo: string;
  version: string;
  idioma: string;
  vigente: boolean;
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

const TIPOS = ['encargado_tratamiento', 'confidencialidad', 'transferencia_internacional', 'clausulas_arco', 'otro'];
const emptyForm = { nombre: '', tipo: 'encargado_tratamiento', version: '1.0', idioma: 'es', contenidoUrl: '' };

function ModuleContent() {
  const toast = useToast();
  const [items, setItems] = useState<Plantilla[] | null>(null);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function cargar() {
    try {
      const res = await apiFetch<{ data: Plantilla[] }>('/plantillas-contrato');
      setItems(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar las plantillas: ${(err as Error).message}`);
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
      await apiFetch('/plantillas-contrato', { method: 'POST', body: JSON.stringify(omitEmpty({ ...form, empresaId })) });
      toast.success(`Plantilla "${form.nombre}" creada`);
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
    if (!confirm(`¿Eliminar la plantilla "${nombre}"?`)) return;
    try {
      await apiFetch(`/plantillas-contrato/${id}`, { method: 'DELETE' });
      toast.success('Plantilla eliminada');
      cargar();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const filtrados = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => [i.nombre, i.tipo].some((v) => v?.toLowerCase().includes(q)));
  }, [items, query]);

  return (
    <div className="dpo-module">
      <div className="dpo-module-header">
        <div>
          <h2>Plantillas de Contratos</h2>
          <p className="dpo-module-subtitle">Gestiona las plantillas legales (DPA, confidencialidad, transferencias internacionales…).</p>
        </div>
        <button className="dpo-btn dpo-btn-primary" onClick={() => setShowModal(true)}>
          <Icon name="plus" size={16} /> Nueva plantilla
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
          <Icon name="file-text" size={32} />
          <p className="dpo-empty-title">Sin plantillas registradas</p>
          <p>Crea la primera plantilla de contrato para reutilizarla con terceros.</p>
        </div>
      ) : (
        <div className="dpo-table-wrap">
          <table className="dpo-table">
            <thead>
              <tr><th>Nombre</th><th>Tipo</th><th>Versión</th><th>Idioma</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.nombre}</strong></td>
                  <td><span className="dpo-badge dpo-badge-neutral">{p.tipo}</span></td>
                  <td>{p.version}</td>
                  <td>{p.idioma?.toUpperCase()}</td>
                  <td><span className={`dpo-badge ${p.vigente ? 'dpo-badge-success' : 'dpo-badge-neutral'}`}>{p.vigente ? 'Vigente' : 'Obsoleta'}</span></td>
                  <td className="dpo-table-actions">
                    <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => eliminar(p.id, p.nombre)} title="Eliminar">
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
        <Modal title="Nueva plantilla de contrato" onClose={() => setShowModal(false)}>
          <form className="dpo-form" onSubmit={crear}>
            <div className="dpo-field">
              <label>Nombre *</label>
              <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div className="dpo-field">
              <label>Tipo *</label>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Versión</label>
                <input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
              </div>
              <div className="dpo-field">
                <label>Idioma</label>
                <input value={form.idioma} onChange={(e) => setForm({ ...form, idioma: e.target.value })} />
              </div>
            </div>
            <div className="dpo-field">
              <label>URL del documento</label>
              <input value={form.contenidoUrl} onChange={(e) => setForm({ ...form, contenidoUrl: e.target.value })} placeholder="https://…" />
            </div>
            <div className="dpo-form-actions">
              <button type="button" className="dpo-btn dpo-btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button type="submit" className="dpo-btn dpo-btn-primary" disabled={saving}>{saving && <span className="dpo-spinner" />} Crear</button>
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
