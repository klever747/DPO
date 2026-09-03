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

interface Plantilla {
  id: string;
  empresaId: string;
  nombre: string;
  tipo: string;
  version: string;
  idioma: string;
  contenidoUrl?: string;
  vigente: boolean;
}

const TIPOS = ['encargado_tratamiento', 'confidencialidad', 'transferencia_internacional', 'clausulas_arco', 'otro'];
const emptyForm = { empresaId: '', nombre: '', tipo: 'encargado_tratamiento', version: '1.0', idioma: 'es' };

function ModuleContent() {
  const toast = useToast();
  const [empresas, setEmpresas] = useState<EmpresaRef[] | null>(null);
  const [items, setItems] = useState<Plantilla[] | null>(null);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; plantilla?: Plantilla } | null>(null);
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
      const res = await apiFetch<{ data: Plantilla[] }>('/plantillas-contrato');
      setItems(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar las plantillas: ${(err as Error).message}`);
      setItems([]);
    }
  }

  useEffect(() => {
    cargarEmpresas();
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const empresasById = useMemo(() => {
    const map = new Map<string, EmpresaRef>();
    (empresas ?? []).forEach((e) => map.set(e.id, e));
    return map;
  }, [empresas]);

  function abrirCrear() {
    setForm({ ...emptyForm, empresaId: empresas?.length === 1 ? empresas[0].id : '' });
    setDocumentoFile(null);
    setModal({ mode: 'create' });
  }

  function abrirEditar(p: Plantilla) {
    setForm({ empresaId: p.empresaId, nombre: p.nombre, tipo: p.tipo, version: p.version, idioma: p.idioma });
    setDocumentoFile(null);
    setModal({ mode: 'edit', plantilla: p });
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!form.empresaId) {
      toast.error('Selecciona la empresa de la plantilla');
      return;
    }
    setSaving(true);
    try {
      let contenidoUrl: string | undefined;
      if (documentoFile) {
        const res = await apiUpload<{ url: string }>('/plantillas-contrato/documento', documentoFile);
        contenidoUrl = res.url;
      }
      if (modal?.mode === 'edit' && modal.plantilla) {
        await apiFetch(`/plantillas-contrato/${modal.plantilla.id}`, {
          method: 'PATCH',
          body: JSON.stringify(omitEmpty({ ...form, contenidoUrl })),
        });
        toast.success('Plantilla actualizada');
      } else {
        await apiFetch('/plantillas-contrato', {
          method: 'POST',
          body: JSON.stringify(omitEmpty({ ...form, contenidoUrl })),
        });
        toast.success(`Plantilla "${form.nombre}" creada`);
      }
      setForm(emptyForm);
      setDocumentoFile(null);
      setModal(null);
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
    return items.filter((i) => [i.nombre, i.tipo].some((v) => v?.toLowerCase().includes(q)));
  }, [items, query]);

  return (
    <div className="dpo-module">
      <div className="dpo-module-header">
        <div>
          <h2>Plantillas de Contratos</h2>
          <p className="dpo-module-subtitle">Gestiona las plantillas legales (DPA, confidencialidad, transferencias internacionales…).</p>
        </div>
        <button className="dpo-btn dpo-btn-primary" onClick={abrirCrear}>
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
              <tr><th>Empresa</th><th>Nombre</th><th>Tipo</th><th>Versión</th><th>Idioma</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id}>
                  <td className="dpo-muted">{empresasById.get(p.empresaId)?.nombre ?? '—'}</td>
                  <td><strong>{p.nombre}</strong></td>
                  <td><span className="dpo-badge dpo-badge-neutral">{p.tipo}</span></td>
                  <td>{p.version}</td>
                  <td>{p.idioma?.toUpperCase()}</td>
                  <td><span className={`dpo-badge ${p.vigente ? 'dpo-badge-success' : 'dpo-badge-neutral'}`}>{p.vigente ? 'Vigente' : 'Obsoleta'}</span></td>
                  <td className="dpo-table-actions">
                    {p.contenidoUrl && (
                      <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => verDocumento(p.contenidoUrl!)} title="Ver/descargar plantilla">
                        <Icon name="file-text" size={15} />
                      </button>
                    )}
                    <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => abrirEditar(p)} title="Editar">
                      <Icon name="clipboard" size={15} />
                    </button>
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

      {modal && (
        <Modal title={modal.mode === 'edit' ? 'Editar plantilla de contrato' : 'Nueva plantilla de contrato'} onClose={() => setModal(null)}>
          <form className="dpo-form" onSubmit={guardar}>
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
              <label>
                {modal.mode === 'edit' ? 'Reemplazar plantilla (.docx o .pdf)' : 'Plantilla (.docx o .pdf)'}
                {modal.mode === 'edit' && modal.plantilla?.contenidoUrl && (
                  <span className="dpo-muted"> — deja vacío para conservar el archivo actual</span>
                )}
              </label>
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setDocumentoFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="dpo-form-actions">
              <button type="button" className="dpo-btn dpo-btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
              <button type="submit" className="dpo-btn dpo-btn-primary" disabled={saving}>
                {saving && <span className="dpo-spinner" />} {modal.mode === 'edit' ? 'Guardar cambios' : 'Crear'}
              </button>
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
