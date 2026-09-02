import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch, omitEmpty } from './lib/api';
import { Icon } from './ui/Icon';
import { Modal } from './ui/Modal';
import { TableSkeleton } from './ui/Skeleton';
import { ToastProvider, useToast } from './ui/Toast';
import './styles.css';

interface Evidencia {
  id: string;
  moduloOrigen: string;
  tipoEvidencia: string;
  nombreArchivo: string;
  urlAlmacenamiento: string;
  subidoPor?: string;
  fechaSubida: string;
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

const MODULOS = ['consent', 'rat', 'arco', 'breach', 'retention', 'ethics', 'maturity', 'training', 'contracts', 'audit'];
const TIPOS = ['documento', 'captura', 'registro', 'firma', 'otro'];
const emptyForm = { moduloOrigen: 'consent', referenciaId: '', tipoEvidencia: 'documento', nombreArchivo: '', urlAlmacenamiento: '', subidoPor: '' };

function ModuleContent() {
  const toast = useToast();
  const [items, setItems] = useState<Evidencia[] | null>(null);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function cargar() {
    try {
      const res = await apiFetch<{ data: Evidencia[] }>('/evidencias');
      setItems(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar las evidencias: ${(err as Error).message}`);
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
      await apiFetch('/evidencias', { method: 'POST', body: JSON.stringify(omitEmpty({ ...form, empresaId })) });
      toast.success(`Evidencia "${form.nombreArchivo}" registrada`);
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
    if (!confirm(`¿Eliminar la evidencia "${nombre}"?`)) return;
    try {
      await apiFetch(`/evidencias/${id}`, { method: 'DELETE' });
      toast.success('Evidencia eliminada');
      cargar();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const filtrados = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => [i.nombreArchivo, i.moduloOrigen, i.tipoEvidencia].some((v) => v?.toLowerCase().includes(q)));
  }, [items, query]);

  return (
    <div className="dpo-module">
      <div className="dpo-module-header">
        <div>
          <h2>Evidencias</h2>
          <p className="dpo-module-subtitle">Repositorio de evidencias documentales de todos los módulos de cumplimiento.</p>
        </div>
        <button className="dpo-btn dpo-btn-primary" onClick={() => setShowModal(true)}>
          <Icon name="plus" size={16} /> Nueva evidencia
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
          <Icon name="archive" size={32} />
          <p className="dpo-empty-title">Sin evidencias registradas</p>
          <p>Registra la primera evidencia documental (URL de almacenamiento externo).</p>
        </div>
      ) : (
        <div className="dpo-table-wrap">
          <table className="dpo-table">
            <thead>
              <tr><th>Archivo</th><th>Módulo</th><th>Tipo</th><th>Subido por</th><th>Fecha</th><th></th></tr>
            </thead>
            <tbody>
              {filtrados.map((e) => (
                <tr key={e.id}>
                  <td><a href={e.urlAlmacenamiento} target="_blank" rel="noreferrer"><strong>{e.nombreArchivo}</strong></a></td>
                  <td><span className="dpo-badge dpo-badge-neutral">{e.moduloOrigen}</span></td>
                  <td>{e.tipoEvidencia}</td>
                  <td>{e.subidoPor || '—'}</td>
                  <td className="dpo-muted">{new Date(e.fechaSubida).toLocaleDateString()}</td>
                  <td className="dpo-table-actions">
                    <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => eliminar(e.id, e.nombreArchivo)} title="Eliminar">
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
        <Modal title="Nueva evidencia" onClose={() => setShowModal(false)}>
          <form className="dpo-form" onSubmit={crear}>
            <div className="dpo-field">
              <label>Nombre del archivo *</label>
              <input value={form.nombreArchivo} onChange={(e) => setForm({ ...form, nombreArchivo: e.target.value })} required />
            </div>
            <div className="dpo-field">
              <label>URL de almacenamiento *</label>
              <input value={form.urlAlmacenamiento} onChange={(e) => setForm({ ...form, urlAlmacenamiento: e.target.value })} placeholder="https://…" required />
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Módulo de origen</label>
                <select value={form.moduloOrigen} onChange={(e) => setForm({ ...form, moduloOrigen: e.target.value })}>
                  {MODULOS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="dpo-field">
                <label>Tipo</label>
                <select value={form.tipoEvidencia} onChange={(e) => setForm({ ...form, tipoEvidencia: e.target.value })}>
                  {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="dpo-field">
              <label>ID de referencia (del registro relacionado) *</label>
              <input value={form.referenciaId} onChange={(e) => setForm({ ...form, referenciaId: e.target.value })} placeholder="UUID del registro en el módulo de origen" required />
            </div>
            <div className="dpo-field">
              <label>Subido por</label>
              <input value={form.subidoPor} onChange={(e) => setForm({ ...form, subidoPor: e.target.value })} />
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
