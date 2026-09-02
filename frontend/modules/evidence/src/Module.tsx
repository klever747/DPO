import { FormEvent, useEffect, useMemo, useState } from 'react';
import { abrirArchivoProtegido, apiFetch, apiUpload, omitEmpty } from './lib/api';
import { Icon } from './ui/Icon';
import { Modal } from './ui/Modal';
import { TableSkeleton } from './ui/Skeleton';
import { ToastProvider, useToast } from './ui/Toast';
import './styles.css';

interface EmpresaRef {
  id: string;
  nombre: string;
}

interface Evidencia {
  id: string;
  empresaId: string;
  moduloOrigen: string;
  referenciaId?: string;
  tipoEvidencia: string;
  nombreArchivo: string;
  urlAlmacenamiento: string;
  hashIntegridad?: string;
  subidoPor?: string;
  fechaSubida: string;
}

const MODULOS = ['consent', 'rat', 'arco', 'breach', 'retention', 'ethics', 'maturity', 'training', 'contracts', 'audit', 'otro'];
const TIPOS = ['documento', 'captura', 'registro', 'firma', 'otro'];
const emptyForm = { empresaId: '', moduloOrigen: 'otro', referenciaId: '', tipoEvidencia: 'documento', subidoPor: '' };

function ModuleContent() {
  const toast = useToast();
  const [empresas, setEmpresas] = useState<EmpresaRef[] | null>(null);
  const [items, setItems] = useState<Evidencia[] | null>(null);
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [documentoFile, setDocumentoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function cargarEmpresas() {
    try {
      const res = await apiFetch<{ data: EmpresaRef[] }>('/empresas');
      setEmpresas(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar las empresas: ${(err as Error).message}`);
      setEmpresas([]);
    }
  }

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
    cargarEmpresas();
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function abrirCrear() {
    setForm({ ...emptyForm, empresaId: empresas?.length === 1 ? empresas[0].id : '' });
    setDocumentoFile(null);
    setShowModal(true);
  }

  async function crear(e: FormEvent) {
    e.preventDefault();
    if (!form.empresaId) {
      toast.error('Selecciona la empresa de la evidencia');
      return;
    }
    if (!documentoFile) {
      toast.error('Selecciona el documento PDF escaneado');
      return;
    }
    setSaving(true);
    try {
      const up = await apiUpload<{ url: string; nombreArchivo: string; hashIntegridad: string }>('/evidencias/documento', documentoFile);
      await apiFetch('/evidencias', {
        method: 'POST',
        body: JSON.stringify(
          omitEmpty({
            ...form,
            nombreArchivo: up.nombreArchivo,
            urlAlmacenamiento: up.url,
            hashIntegridad: up.hashIntegridad,
          }),
        ),
      });
      toast.success(`Evidencia "${up.nombreArchivo}" registrada`);
      setForm(emptyForm);
      setDocumentoFile(null);
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

  async function verDocumento(url: string) {
    try {
      await abrirArchivoProtegido(url);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const filtrados = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => [i.nombreArchivo, i.moduloOrigen, i.tipoEvidencia, i.subidoPor].some((v) => v?.toLowerCase().includes(q)));
  }, [items, query]);

  return (
    <div className="dpo-module">
      <div className="dpo-module-header">
        <div>
          <h2>Evidencias</h2>
          <p className="dpo-module-subtitle">Repositorio de evidencias documentales de todos los módulos de cumplimiento.</p>
        </div>
        <button className="dpo-btn dpo-btn-primary" onClick={abrirCrear}>
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
          <p>Sube el primer documento PDF escaneado como evidencia.</p>
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
                  <td><strong>{e.nombreArchivo}</strong></td>
                  <td><span className="dpo-badge dpo-badge-neutral">{e.moduloOrigen}</span></td>
                  <td>{e.tipoEvidencia}</td>
                  <td>{e.subidoPor || '—'}</td>
                  <td className="dpo-muted">{new Date(e.fechaSubida).toLocaleDateString()}</td>
                  <td className="dpo-table-actions">
                    <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => verDocumento(e.urlAlmacenamiento)} title="Ver/descargar PDF">
                      <Icon name="file-text" size={15} />
                    </button>
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
            {(empresas?.length ?? 0) > 1 && (
              <div className="dpo-field">
                <label>Empresa *</label>
                <select value={form.empresaId} onChange={(e) => setForm({ ...form, empresaId: e.target.value })} required>
                  <option value="">Selecciona una empresa</option>
                  {(empresas ?? []).map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
            )}
            <div className="dpo-field">
              <label>Documento escaneado (PDF) *</label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setDocumentoFile(e.target.files?.[0] ?? null)}
              />
              <p className="dpo-muted" style={{ fontSize: '0.78rem', margin: '4px 0 0' }}>
                Se calcula automáticamente un hash de integridad (SHA-256) del archivo al subirlo.
              </p>
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
              <label>ID de referencia (opcional)</label>
              <input value={form.referenciaId} onChange={(e) => setForm({ ...form, referenciaId: e.target.value })} placeholder="UUID del registro relacionado, si aplica" />
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
