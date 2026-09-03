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

interface Titular {
  id: string;
  nombre: string;
  email?: string;
  documentoIdentidad?: string;
  empresaIds: string[];
}

interface Consentimiento {
  id: string;
  empresaId: string;
  titularId: string;
  finalidad: string;
  baseLegal?: string;
  estado: string;
  estadoDocumento?: string;
  tipoArchivo?: string;
  fechaOtorgamiento: string;
  evidenciaUrl?: string;
}

/** Bases legales más habituales para el tratamiento de datos (LOPDP / RGPD). */
const BASES_LEGALES = [
  'Consentimiento del titular',
  'Ejecución de un contrato',
  'Cumplimiento de una obligación legal',
  'Protección de intereses vitales',
  'Cumplimiento de una misión de interés público',
  'Interés legítimo del responsable',
  'Otro',
];

const TIPOS_ARCHIVO = [
  { value: 'digital', label: 'Digital' },
  { value: 'fisico', label: 'Físico' },
  { value: 'escaneado', label: 'Escaneado' },
  { value: 'otro', label: 'Otro' },
];

const ESTADOS_DOCUMENTO = [
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'firmado', label: 'Firmado' },
  { value: 'no_autorizado', label: 'No autorizado' },
];

const emptyTitular = { nombre: '', documentoIdentidad: '', email: '', empresaIds: [] as string[] };
const emptyConsentimiento = {
  titularId: '',
  finalidad: '',
  baseLegal: BASES_LEGALES[0],
  tipoArchivo: 'digital',
  estadoDocumento: 'en_proceso',
  empresaId: '',
};

const estadoBadge: Record<string, string> = {
  otorgado: 'dpo-badge-success',
  revocado: 'dpo-badge-danger',
  expirado: 'dpo-badge-neutral',
};

const estadoDocumentoBadge: Record<string, string> = {
  firmado: 'dpo-badge-success',
  en_proceso: 'dpo-badge-neutral',
  no_autorizado: 'dpo-badge-danger',
};

function ModuleContent() {
  const toast = useToast();
  const [tab, setTab] = useState<'titulares' | 'consentimientos'>('consentimientos');
  const [empresas, setEmpresas] = useState<EmpresaRef[] | null>(null);
  const [titulares, setTitulares] = useState<Titular[] | null>(null);
  const [consentimientos, setConsentimientos] = useState<Consentimiento[] | null>(null);
  const [query, setQuery] = useState('');
  const [titularModal, setTitularModal] = useState<{ mode: 'create' | 'edit'; titular?: Titular } | null>(null);
  const [consentimientoModal, setConsentimientoModal] = useState<{ mode: 'create' | 'edit'; consentimiento?: Consentimiento } | null>(null);
  const [nuevoTitular, setNuevoTitular] = useState(emptyTitular);
  const [nuevoConsentimiento, setNuevoConsentimiento] = useState(emptyConsentimiento);
  const [evidenciaFile, setEvidenciaFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [paginaConsentimientos, setPaginaConsentimientos] = useState(1);
  const TAM_PAGINA = 10;

  async function cargarEmpresas() {
    try {
      const res = await apiFetch<{ data: EmpresaRef[] }>('/empresas');
      setEmpresas(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar las empresas: ${(err as Error).message}`);
      setEmpresas([]);
    }
  }

  async function cargarTitulares() {
    try {
      const res = await apiFetch<{ data: Titular[] }>('/titulares');
      setTitulares(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar los titulares: ${(err as Error).message}`);
      setTitulares([]);
    }
  }

  async function cargarConsentimientos() {
    try {
      const res = await apiFetch<{ data: Consentimiento[] }>('/consentimientos?limit=100');
      setConsentimientos(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar los consentimientos: ${(err as Error).message}`);
      setConsentimientos([]);
    }
  }

  useEffect(() => {
    cargarEmpresas();
    cargarTitulares();
    cargarConsentimientos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function abrirCrearTitular() {
    setNuevoTitular({ ...emptyTitular, empresaIds: empresas?.length === 1 ? [empresas[0].id] : [] });
    setTitularModal({ mode: 'create' });
  }

  function abrirEditarTitular(t: Titular) {
    setNuevoTitular({
      nombre: t.nombre,
      documentoIdentidad: t.documentoIdentidad ?? '',
      email: t.email ?? '',
      empresaIds: t.empresaIds ?? [],
    });
    setTitularModal({ mode: 'edit', titular: t });
  }

  async function eliminarTitular(id: string, nombre: string) {
    if (!confirm(`¿Eliminar al titular "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await apiFetch(`/titulares/${id}`, { method: 'DELETE' });
      toast.success('Titular eliminado');
      cargarTitulares();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  function toggleEmpresaEnTitular(empresaId: string) {
    setNuevoTitular((f) => ({
      ...f,
      empresaIds: f.empresaIds.includes(empresaId)
        ? f.empresaIds.filter((id) => id !== empresaId)
        : [...f.empresaIds, empresaId],
    }));
  }

  function abrirCrearConsentimiento() {
    setNuevoConsentimiento({ ...emptyConsentimiento, empresaId: empresas?.length === 1 ? empresas[0].id : '' });
    setEvidenciaFile(null);
    setConsentimientoModal({ mode: 'create' });
  }

  function abrirEditarConsentimiento(c: Consentimiento) {
    setNuevoConsentimiento({
      titularId: c.titularId,
      finalidad: c.finalidad,
      baseLegal: c.baseLegal ?? BASES_LEGALES[0],
      tipoArchivo: c.tipoArchivo ?? 'digital',
      estadoDocumento: c.estadoDocumento ?? 'en_proceso',
      empresaId: c.empresaId,
    });
    setEvidenciaFile(null);
    setConsentimientoModal({ mode: 'edit', consentimiento: c });
  }

  async function guardarTitular(e: FormEvent) {
    e.preventDefault();
    if (nuevoTitular.empresaIds.length === 0) {
      toast.error('Selecciona al menos una empresa para el titular');
      return;
    }
    setSaving(true);
    try {
      if (titularModal?.mode === 'edit' && titularModal.titular) {
        await apiFetch(`/titulares/${titularModal.titular.id}`, {
          method: 'PATCH',
          body: JSON.stringify(omitEmpty(nuevoTitular)),
        });
        toast.success('Titular actualizado');
      } else {
        await apiFetch('/titulares', { method: 'POST', body: JSON.stringify(omitEmpty(nuevoTitular)) });
        toast.success('Titular registrado');
      }
      setNuevoTitular(emptyTitular);
      setTitularModal(null);
      cargarTitulares();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function guardarConsentimiento(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      let evidenciaUrl: string | undefined;
      if (evidenciaFile) {
        const res = await apiUpload<{ url: string }>('/consentimientos/evidencia', evidenciaFile);
        evidenciaUrl = res.url;
      }
      if (consentimientoModal?.mode === 'edit' && consentimientoModal.consentimiento) {
        await apiFetch(`/consentimientos/${consentimientoModal.consentimiento.id}`, {
          method: 'PATCH',
          body: JSON.stringify(omitEmpty({ ...nuevoConsentimiento, evidenciaUrl })),
        });
        toast.success('Consentimiento actualizado');
      } else {
        await apiFetch('/consentimientos', {
          method: 'POST',
          body: JSON.stringify(omitEmpty({ ...nuevoConsentimiento, evidenciaUrl })),
        });
        toast.success('Consentimiento registrado');
      }
      setNuevoConsentimiento(emptyConsentimiento);
      setEvidenciaFile(null);
      setConsentimientoModal(null);
      cargarConsentimientos();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function verEvidencia(url: string) {
    try {
      await abrirArchivoProtegido(url);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function revocar(id: string) {
    if (!confirm('¿Revocar este consentimiento?')) return;
    try {
      await apiFetch(`/consentimientos/${id}/revocar`, { method: 'POST' });
      toast.success('Consentimiento revocado');
      cargarConsentimientos();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const empresasById = useMemo(() => {
    const map = new Map<string, EmpresaRef>();
    (empresas ?? []).forEach((e) => map.set(e.id, e));
    return map;
  }, [empresas]);

  const titularesById = useMemo(() => {
    const map = new Map<string, Titular>();
    (titulares ?? []).forEach((t) => map.set(t.id, t));
    return map;
  }, [titulares]);

  const titularesFiltrados = useMemo(() => {
    if (!titulares) return [];
    const q = query.trim().toLowerCase();
    if (!q) return titulares;
    return titulares.filter((t) => [t.nombre, t.email].some((v) => v?.toLowerCase().includes(q)));
  }, [titulares, query]);

  const consentimientosFiltrados = useMemo(() => {
    if (!consentimientos) return [];
    const q = query.trim().toLowerCase();
    if (!q) return consentimientos;
    return consentimientos.filter((c) => {
      const titularNombre = titularesById.get(c.titularId)?.nombre ?? '';
      const empresaNombre = empresasById.get(c.empresaId)?.nombre ?? '';
      return [c.finalidad, c.tipoArchivo, c.estado, c.estadoDocumento, titularNombre, empresaNombre].some((v) => v?.toLowerCase().includes(q));
    });
  }, [consentimientos, query, titularesById, empresasById]);

  const totalPaginasConsentimientos = Math.max(1, Math.ceil(consentimientosFiltrados.length / TAM_PAGINA));

  useEffect(() => {
    setPaginaConsentimientos(1);
  }, [query, consentimientos]);

  const consentimientosPagina = useMemo(() => {
    const inicio = (paginaConsentimientos - 1) * TAM_PAGINA;
    return consentimientosFiltrados.slice(inicio, inicio + TAM_PAGINA);
  }, [consentimientosFiltrados, paginaConsentimientos]);

  return (
    <div className="dpo-module">
      <div className="dpo-module-header">
        <div>
          <h2>Consentimientos</h2>
          <p className="dpo-module-subtitle">Registra titulares de datos y controla sus consentimientos vigentes.</p>
        </div>
        <button
          className="dpo-btn dpo-btn-primary"
          onClick={() => (tab === 'titulares' ? abrirCrearTitular() : abrirCrearConsentimiento())}
        >
          <Icon name="plus" size={16} /> {tab === 'titulares' ? 'Nuevo titular' : 'Nuevo consentimiento'}
        </button>
      </div>

      <div className="dpo-tabs">
        <button className={tab === 'consentimientos' ? 'active' : ''} onClick={() => setTab('consentimientos')}>
          <Icon name="shield" size={15} /> Consentimientos
        </button>
        <button className={tab === 'titulares' ? 'active' : ''} onClick={() => setTab('titulares')}>
          <Icon name="users" size={15} /> Titulares
        </button>
      </div>

      <div className="dpo-toolbar">
        <div className="dpo-search">
          <Icon name="search" size={16} />
          <input placeholder="Buscar…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {tab === 'titulares' &&
        (titulares === null ? (
          <TableSkeleton />
        ) : titularesFiltrados.length === 0 ? (
          <div className="dpo-empty">
            <Icon name="users" size={32} />
            <p className="dpo-empty-title">Sin titulares registrados</p>
            <p>Registra a las personas cuyos datos tratas antes de asociarles consentimientos.</p>
          </div>
        ) : (
          <div className="dpo-table-wrap">
            <table className="dpo-table">
              <thead><tr><th>Nombre</th><th>Cédula</th><th>Email</th><th>Empresas</th><th></th></tr></thead>
              <tbody>
                {titularesFiltrados.map((t) => (
                  <tr key={t.id}>
                    <td><strong>{t.nombre}</strong></td>
                    <td>{t.documentoIdentidad || '—'}</td>
                    <td>{t.email || '—'}</td>
                    <td className="dpo-muted">
                      {(t.empresaIds ?? []).map((id) => empresasById.get(id)?.nombre ?? id).join(', ') || '—'}
                    </td>
                    <td className="dpo-table-actions">
                      <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => abrirEditarTitular(t)} title="Editar">
                        <Icon name="clipboard" size={15} />
                      </button>
                      <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => eliminarTitular(t.id, t.nombre)} title="Eliminar">
                        <Icon name="trash" size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {tab === 'consentimientos' &&
        (consentimientos === null ? (
          <TableSkeleton />
        ) : consentimientosFiltrados.length === 0 ? (
          <div className="dpo-empty">
            <Icon name="shield" size={32} />
            <p className="dpo-empty-title">Sin consentimientos registrados</p>
            <p>Registra un titular y luego su primer consentimiento.</p>
          </div>
        ) : (
          <div className="dpo-table-wrap">
            <table className="dpo-table">
              <thead>
                <tr><th>Titular</th><th>Empresa</th><th>Finalidad</th><th>Tipo de archivo</th><th>Estado</th><th>Estado documento</th><th>Fecha</th><th></th></tr>
              </thead>
              <tbody>
                {consentimientosPagina.map((c) => (
                  <tr key={c.id}>
                    <td>{titularesById.get(c.titularId)?.nombre ?? '—'}</td>
                    <td className="dpo-muted">{empresasById.get(c.empresaId)?.nombre ?? '—'}</td>
                    <td>{c.finalidad}</td>
                    <td className="dpo-muted">{TIPOS_ARCHIVO.find((t) => t.value === c.tipoArchivo)?.label ?? '—'}</td>
                    <td><span className={`dpo-badge ${estadoBadge[c.estado] ?? 'dpo-badge-neutral'}`}>{c.estado}</span></td>
                    <td>
                      <span className={`dpo-badge ${estadoDocumentoBadge[c.estadoDocumento ?? ''] ?? 'dpo-badge-neutral'}`}>
                        {ESTADOS_DOCUMENTO.find((e) => e.value === c.estadoDocumento)?.label ?? '—'}
                      </span>
                    </td>
                    <td className="dpo-muted">{new Date(c.fechaOtorgamiento).toLocaleDateString()}</td>
                    <td className="dpo-table-actions">
                      <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => abrirEditarConsentimiento(c)} title="Editar">
                        <Icon name="clipboard" size={15} />
                      </button>
                      {c.evidenciaUrl && (
                        <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => verEvidencia(c.evidenciaUrl!)} title="Ver evidencia (PDF)">
                          <Icon name="file-text" size={15} />
                        </button>
                      )}
                      {c.estado === 'otorgado' && (
                        <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => revocar(c.id)}>Revocar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {tab === 'consentimientos' && consentimientos !== null && consentimientosFiltrados.length > 0 && (
        <div className="dpo-pagination">
          <button
            className="dpo-btn dpo-btn-secondary dpo-btn-sm"
            onClick={() => setPaginaConsentimientos((p) => Math.max(1, p - 1))}
            disabled={paginaConsentimientos <= 1}
          >
            ‹ Anterior
          </button>
          <span className="dpo-muted" style={{ fontSize: '0.85rem' }}>
            Página {paginaConsentimientos} de {totalPaginasConsentimientos} ({consentimientosFiltrados.length} en total)
          </span>
          <button
            className="dpo-btn dpo-btn-secondary dpo-btn-sm"
            onClick={() => setPaginaConsentimientos((p) => Math.min(totalPaginasConsentimientos, p + 1))}
            disabled={paginaConsentimientos >= totalPaginasConsentimientos}
          >
            Siguiente ›
          </button>
        </div>
      )}

      {titularModal && (
        <Modal title={titularModal.mode === 'edit' ? 'Editar titular' : 'Nuevo titular'} onClose={() => setTitularModal(null)}>
          <form className="dpo-form" onSubmit={guardarTitular}>
            {(empresas?.length ?? 0) > 1 && (
              <div className="dpo-field">
                <label>Empresas a las que pertenece *</label>
                <div className="dpo-checklist">
                  {(empresas ?? []).map((e) => (
                    <label key={e.id} className="dpo-checklist-item">
                      <input type="checkbox" checked={nuevoTitular.empresaIds.includes(e.id)} onChange={() => toggleEmpresaEnTitular(e.id)} />
                      {e.nombre}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="dpo-field">
              <label>Nombres *</label>
              <input value={nuevoTitular.nombre} onChange={(e) => setNuevoTitular({ ...nuevoTitular, nombre: e.target.value })} required />
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Cédula</label>
                <input value={nuevoTitular.documentoIdentidad} onChange={(e) => setNuevoTitular({ ...nuevoTitular, documentoIdentidad: e.target.value })} />
              </div>
              <div className="dpo-field">
                <label>Correo</label>
                <input type="email" value={nuevoTitular.email} onChange={(e) => setNuevoTitular({ ...nuevoTitular, email: e.target.value })} />
              </div>
            </div>
            <div className="dpo-form-actions">
              <button type="button" className="dpo-btn dpo-btn-secondary" onClick={() => setTitularModal(null)}>Cancelar</button>
              <button type="submit" className="dpo-btn dpo-btn-primary" disabled={saving}>
                {saving && <span className="dpo-spinner" />} {titularModal.mode === 'edit' ? 'Guardar cambios' : 'Registrar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {consentimientoModal && (
        <Modal
          title={consentimientoModal.mode === 'edit' ? 'Editar consentimiento' : 'Nuevo consentimiento'}
          onClose={() => setConsentimientoModal(null)}
        >
          <form className="dpo-form" onSubmit={guardarConsentimiento}>
            {(empresas?.length ?? 0) > 1 && (
              <div className="dpo-field">
                <label>Empresa *</label>
                <select value={nuevoConsentimiento.empresaId} onChange={(e) => setNuevoConsentimiento({ ...nuevoConsentimiento, empresaId: e.target.value })} required>
                  <option value="">Selecciona una empresa</option>
                  {(empresas ?? []).map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
            )}
            <div className="dpo-field">
              <label>Titular *</label>
              <select value={nuevoConsentimiento.titularId} onChange={(e) => setNuevoConsentimiento({ ...nuevoConsentimiento, titularId: e.target.value })} required>
                <option value="">Selecciona un titular</option>
                {(titulares ?? []).map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>
            <div className="dpo-field">
              <label>Finalidad *</label>
              <input value={nuevoConsentimiento.finalidad} onChange={(e) => setNuevoConsentimiento({ ...nuevoConsentimiento, finalidad: e.target.value })} required />
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Base legal</label>
                <select value={nuevoConsentimiento.baseLegal} onChange={(e) => setNuevoConsentimiento({ ...nuevoConsentimiento, baseLegal: e.target.value })}>
                  {BASES_LEGALES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="dpo-field">
                <label>Tipo de archivo</label>
                <select value={nuevoConsentimiento.tipoArchivo} onChange={(e) => setNuevoConsentimiento({ ...nuevoConsentimiento, tipoArchivo: e.target.value })}>
                  {TIPOS_ARCHIVO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div className="dpo-field">
              <label>Estado del documento</label>
              <select value={nuevoConsentimiento.estadoDocumento} onChange={(e) => setNuevoConsentimiento({ ...nuevoConsentimiento, estadoDocumento: e.target.value })}>
                {ESTADOS_DOCUMENTO.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
            <div className="dpo-field">
              <label>
                {consentimientoModal.mode === 'edit' ? 'Reemplazar evidencia (PDF)' : 'Evidencia (PDF)'}
                {consentimientoModal.mode === 'edit' && consentimientoModal.consentimiento?.evidenciaUrl && (
                  <span className="dpo-muted"> — deja vacío para conservar el archivo actual</span>
                )}
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setEvidenciaFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="dpo-form-actions">
              <button type="button" className="dpo-btn dpo-btn-secondary" onClick={() => setConsentimientoModal(null)}>Cancelar</button>
              <button type="submit" className="dpo-btn dpo-btn-primary" disabled={saving}>
                {saving && <span className="dpo-spinner" />} {consentimientoModal.mode === 'edit' ? 'Guardar cambios' : 'Registrar'}
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
