import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch, omitEmpty } from './lib/api';
import { Icon } from './ui/Icon';
import { Modal } from './ui/Modal';
import { TableSkeleton } from './ui/Skeleton';
import { ToastProvider, useToast } from './ui/Toast';
import './styles.css';

interface Denuncia {
  id: string;
  codigoSeguimiento: string;
  categoria: string;
  descripcion: string;
  denuncianteAnonimo: boolean;
  estado: string;
  fechaRecepcion: string;
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

const CATEGORIAS = ['fraude', 'acoso', 'corrupcion', 'proteccion_datos', 'discriminacion', 'otro'];
const ESTADOS = ['recibida', 'en_investigacion', 'resuelta', 'archivada'];
const emptyForm = { categoria: 'otro', descripcion: '', denuncianteAnonimo: true, denuncianteContacto: '' };

const estadoBadge: Record<string, string> = {
  recibida: 'dpo-badge-warning',
  en_investigacion: 'dpo-badge-primary',
  resuelta: 'dpo-badge-success',
  archivada: 'dpo-badge-neutral',
};

function ModuleContent() {
  const toast = useToast();
  const [items, setItems] = useState<Denuncia[] | null>(null);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function cargar() {
    try {
      const res = await apiFetch<{ data: Denuncia[] }>('/denuncias');
      setItems(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar las denuncias: ${(err as Error).message}`);
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
      const res = await apiFetch<{ codigoSeguimiento: string }>('/denuncias', {
        method: 'POST',
        body: JSON.stringify(omitEmpty({ ...form, empresaId, denuncianteContacto: form.denuncianteAnonimo ? undefined : form.denuncianteContacto })),
      });
      toast.success(`Denuncia registrada — código de seguimiento: ${res.codigoSeguimiento}`);
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
      await apiFetch(`/denuncias/${id}`, { method: 'PATCH', body: JSON.stringify({ estado }) });
      toast.success('Estado actualizado');
      cargar();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function eliminar(id: string, codigo: string) {
    if (!confirm(`¿Eliminar la denuncia ${codigo}?`)) return;
    try {
      await apiFetch(`/denuncias/${id}`, { method: 'DELETE' });
      toast.success('Denuncia eliminada');
      cargar();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const filtrados = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => [i.codigoSeguimiento, i.categoria, i.estado].some((v) => v?.toLowerCase().includes(q)));
  }, [items, query]);

  return (
    <div className="dpo-module">
      <div className="dpo-module-header">
        <div>
          <h2>Canal Ético</h2>
          <p className="dpo-module-subtitle">Recibe y da seguimiento a denuncias internas de forma confidencial.</p>
        </div>
        <button className="dpo-btn dpo-btn-primary" onClick={() => setShowModal(true)}>
          <Icon name="plus" size={16} /> Nueva denuncia
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
          <Icon name="message" size={32} />
          <p className="dpo-empty-title">Sin denuncias registradas</p>
          <p>Cuando se registre una denuncia, aparecerá aquí con su código de seguimiento.</p>
        </div>
      ) : (
        <div className="dpo-table-wrap">
          <table className="dpo-table">
            <thead>
              <tr><th>Código</th><th>Categoría</th><th>Anónima</th><th>Estado</th><th>Recepción</th><th></th></tr>
            </thead>
            <tbody>
              {filtrados.map((d) => (
                <tr key={d.id}>
                  <td className="dpo-mono"><strong>{d.codigoSeguimiento}</strong></td>
                  <td><span className="dpo-badge dpo-badge-neutral">{d.categoria}</span></td>
                  <td>{d.denuncianteAnonimo ? 'Sí' : 'No'}</td>
                  <td>
                    <select value={d.estado} onChange={(e) => cambiarEstado(d.id, e.target.value)} style={{ border: 'none', background: 'transparent', fontWeight: 600, cursor: 'pointer' }}>
                      {ESTADOS.map((es) => <option key={es} value={es}>{es}</option>)}
                    </select>
                  </td>
                  <td className="dpo-muted">{new Date(d.fechaRecepcion).toLocaleDateString()}</td>
                  <td className="dpo-table-actions">
                    <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => eliminar(d.id, d.codigoSeguimiento)} title="Eliminar">
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
        <Modal title="Nueva denuncia" onClose={() => setShowModal(false)}>
          <form className="dpo-form" onSubmit={crear}>
            <div className="dpo-field">
              <label>Categoría *</label>
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="dpo-field">
              <label>Descripción *</label>
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required />
            </div>
            <div className="dpo-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                id="anonimo"
                checked={form.denuncianteAnonimo}
                onChange={(e) => setForm({ ...form, denuncianteAnonimo: e.target.checked })}
                style={{ width: 'auto' }}
              />
              <label htmlFor="anonimo" style={{ margin: 0 }}>Denuncia anónima</label>
            </div>
            {!form.denuncianteAnonimo && (
              <div className="dpo-field">
                <label>Contacto del denunciante</label>
                <input value={form.denuncianteContacto} onChange={(e) => setForm({ ...form, denuncianteContacto: e.target.value })} />
              </div>
            )}
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
