import { FormEvent, useEffect, useMemo, useState } from 'react';
import { abrirArchivoProtegido, apiFetch, apiUpload, getCurrentUser, omitEmpty } from './lib/api';
import { Icon } from './ui/Icon';
import { Modal } from './ui/Modal';
import { TableSkeleton } from './ui/Skeleton';
import { ToastProvider, useToast } from './ui/Toast';
import './styles.css';

interface EmpresaRef {
  id: string;
  nombre: string;
}

interface UsuarioRef {
  id: string;
  nombre: string;
  apellidos?: string;
  email: string;
  departamento?: { id: string; nombre: string } | null;
}

interface Tarea {
  id: string;
  empresaId: string;
  departamentoId?: string;
  departamentoNombre?: string;
  asignadoAId: string;
  asignadoANombre: string;
  asignadoAEmail?: string;
  titulo: string;
  descripcion?: string;
  baseLegal?: string;
  fechaLimite: string;
  estado: 'pendiente' | 'en_revision' | 'completada' | 'rechazada';
  evidenciaUrl?: string;
  revisadoPorEmail?: string;
  comentarioRevision?: string;
  creadoPorEmail?: string;
}

interface Notificacion {
  id: string;
  mensaje: string;
  leida: boolean;
  createdAt: string;
}

const ROLES_REVISORES = new Set(['super_admin', 'admin_empresa', 'dpo', 'auditor']);

/**
 * Artículos de la LOPDP (Ecuador) más usados para justificar tareas de
 * cumplimiento asignadas a jefes de área. Verifica la numeración vigente
 * con tu asesoría legal antes de citarla ante una autoridad, ya que puede
 * variar con reformas o el Reglamento.
 */
const ARTICULOS_LOPDP = [
  'Art. 7-8 LOPDP — Consentimiento del titular (recolección, firma, custodia)',
  'Art. 9, 12 LOPDP — Deber de informar / transparencia (incluye avisos y letreros de videovigilancia)',
  'Art. 13 LOPDP — Derecho de acceso',
  'Art. 14 LOPDP — Derecho de rectificación y actualización',
  'Art. 15 LOPDP — Derecho de eliminación / cancelación',
  'Art. 16 LOPDP — Derecho de oposición',
  'Art. 17 LOPDP — Derecho de portabilidad',
  'Art. 39 LOPDP — Medidas de seguridad y protección de datos desde el diseño',
  'Art. 43-46 LOPDP — Notificación de vulneración de seguridad',
  'Art. 23, 51 LOPDP — Registro de Actividades de Tratamiento (RAT)',
  'Art. 48 LOPDP — Designación del Delegado de Protección de Datos (DPO)',
  'Art. 68 LOPDP — Régimen sancionatorio / infracciones',
];
const OTRO_ARTICULO = 'Otro (especificar)';

const emptyForm = {
  empresaId: '',
  asignadoAId: '',
  asignadoANombre: '',
  asignadoAEmail: '',
  departamentoId: '',
  departamentoNombre: '',
  titulo: '',
  descripcion: '',
  baseLegal: '',
  fechaLimite: '',
};

const estadoBadge: Record<string, string> = {
  pendiente: 'dpo-badge-neutral',
  en_revision: 'dpo-badge-warning',
  completada: 'dpo-badge-success',
  rechazada: 'dpo-badge-danger',
};

const estadoLabel: Record<string, string> = {
  pendiente: 'Pendiente',
  en_revision: 'En revisión',
  completada: 'Completada',
  rechazada: 'Rechazada',
};

function diasInfo(fechaLimite: string, estado: string): { text: string; tono: 'danger' | 'warning' | 'neutral' } | null {
  if (estado === 'completada') return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const limite = new Date(`${fechaLimite}T00:00:00`);
  const dias = Math.round((limite.getTime() - hoy.getTime()) / 86400000);
  if (dias < 0) return { text: `Vencida hace ${Math.abs(dias)} día(s)`, tono: 'danger' };
  if (dias === 0) return { text: 'Vence hoy', tono: 'danger' };
  if (dias <= 2) return { text: `${dias} día(s) restantes`, tono: 'warning' };
  return { text: `${dias} día(s) restantes`, tono: 'neutral' };
}

function ModuleContent() {
  const toast = useToast();
  const currentUser = useMemo(() => getCurrentUser(), []);
  const esRevisor = !!currentUser && (currentUser.rol === 'super_admin' || ROLES_REVISORES.has(currentUser.rol));

  const [empresas, setEmpresas] = useState<EmpresaRef[] | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioRef[] | null>(null);
  const [tareas, setTareas] = useState<Tarea[] | null>(null);
  const [notificaciones, setNotificaciones] = useState<Notificacion[] | null>(null);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const [tareaModal, setTareaModal] = useState<{ mode: 'create' | 'edit'; tarea?: Tarea } | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [baseLegalManual, setBaseLegalManual] = useState(false);

  const [evidenciaModal, setEvidenciaModal] = useState<Tarea | null>(null);
  const [evidenciaFile, setEvidenciaFile] = useState<File | null>(null);

  const [revisarModal, setRevisarModal] = useState<Tarea | null>(null);
  const [revisarForm, setRevisarForm] = useState({ aprobada: true, comentario: '' });

  async function cargarEmpresas() {
    try {
      const res = await apiFetch<{ data: EmpresaRef[] }>('/empresas');
      setEmpresas(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar las empresas: ${(err as Error).message}`);
      setEmpresas([]);
    }
  }

  async function cargarUsuarios() {
    try {
      const res = await apiFetch<{ data: UsuarioRef[] }>('/usuarios');
      setUsuarios(res.data);
    } catch {
      setUsuarios([]);
    }
  }

  async function cargarTareas() {
    try {
      const res = await apiFetch<{ data: Tarea[] }>('/tareas');
      setTareas(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar las tareas: ${(err as Error).message}`);
      setTareas([]);
    }
  }

  async function cargarNotificaciones() {
    try {
      const res = await apiFetch<Notificacion[]>('/notificaciones');
      setNotificaciones(res);
    } catch {
      setNotificaciones([]);
    }
  }

  useEffect(() => {
    // Solo quien puede crear/editar tareas necesita el selector de empresa y
    // el listado de usuarios (además, un jefe de área normalmente no tiene
    // acceso al módulo "empresas-usuarios" para poder consultarlos).
    if (esRevisor) {
      cargarEmpresas();
      cargarUsuarios();
    }
    cargarTareas();
    cargarNotificaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const usuariosById = useMemo(() => {
    const map = new Map<string, UsuarioRef>();
    (usuarios ?? []).forEach((u) => map.set(u.id, u));
    return map;
  }, [usuarios]);

  async function marcarNotificacionLeida(id: string) {
    try {
      await apiFetch(`/notificaciones/${id}/leida`, { method: 'PATCH' });
      cargarNotificaciones();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  function abrirCrear() {
    setForm({ ...emptyForm, empresaId: empresas?.length === 1 ? empresas[0].id : '' });
    setBaseLegalManual(false);
    setTareaModal({ mode: 'create' });
  }

  function abrirEditar(t: Tarea) {
    setForm({
      empresaId: t.empresaId,
      asignadoAId: t.asignadoAId,
      asignadoANombre: t.asignadoANombre,
      asignadoAEmail: t.asignadoAEmail ?? '',
      departamentoId: t.departamentoId ?? '',
      departamentoNombre: t.departamentoNombre ?? '',
      titulo: t.titulo,
      descripcion: t.descripcion ?? '',
      baseLegal: t.baseLegal ?? '',
      fechaLimite: t.fechaLimite,
    });
    setBaseLegalManual(!!t.baseLegal && !ARTICULOS_LOPDP.includes(t.baseLegal));
    setTareaModal({ mode: 'edit', tarea: t });
  }

  function seleccionarAsignado(usuarioId: string) {
    const u = usuariosById.get(usuarioId);
    setForm((f) => ({
      ...f,
      asignadoAId: usuarioId,
      asignadoANombre: u ? `${u.nombre} ${u.apellidos ?? ''}`.trim() : '',
      asignadoAEmail: u?.email ?? '',
      departamentoId: u?.departamento?.id ?? '',
      departamentoNombre: u?.departamento?.nombre ?? '',
    }));
  }

  async function guardarTarea(e: FormEvent) {
    e.preventDefault();
    if (!form.empresaId) {
      toast.error('Selecciona la empresa de la tarea');
      return;
    }
    if (!form.asignadoAId) {
      toast.error('Selecciona a quién se asigna la tarea');
      return;
    }
    setSaving(true);
    try {
      if (tareaModal?.mode === 'edit' && tareaModal.tarea) {
        await apiFetch(`/tareas/${tareaModal.tarea.id}`, { method: 'PATCH', body: JSON.stringify(omitEmpty(form)) });
        toast.success('Tarea actualizada');
      } else {
        await apiFetch('/tareas', { method: 'POST', body: JSON.stringify(omitEmpty(form)) });
        toast.success(`Tarea "${form.titulo}" asignada`);
      }
      setTareaModal(null);
      cargarTareas();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function eliminarTarea(id: string, titulo: string) {
    if (!confirm(`¿Eliminar la tarea "${titulo}"?`)) return;
    try {
      await apiFetch(`/tareas/${id}`, { method: 'DELETE' });
      toast.success('Tarea eliminada');
      cargarTareas();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function subirEvidencia(e: FormEvent) {
    e.preventDefault();
    if (!evidenciaModal || !evidenciaFile) {
      toast.error('Selecciona el archivo de evidencia');
      return;
    }
    setSaving(true);
    try {
      await apiUpload(`/tareas/${evidenciaModal.id}/evidencia`, evidenciaFile);
      toast.success('Evidencia enviada para revisión');
      setEvidenciaModal(null);
      setEvidenciaFile(null);
      cargarTareas();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmarRevision(e: FormEvent) {
    e.preventDefault();
    if (!revisarModal) return;
    setSaving(true);
    try {
      await apiFetch(`/tareas/${revisarModal.id}/revisar`, { method: 'POST', body: JSON.stringify(revisarForm) });
      toast.success(revisarForm.aprobada ? 'Tarea marcada como completada' : 'Tarea rechazada, se pidió corregirla');
      setRevisarModal(null);
      cargarTareas();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function enviarRecordatorio(t: Tarea) {
    try {
      await apiFetch(`/tareas/${t.id}/recordatorio`, { method: 'POST' });
      toast.success(`Recordatorio enviado a ${t.asignadoANombre}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function verEvidencia(url: string) {
    try {
      await abrirArchivoProtegido(url);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const tareasFiltradas = useMemo(() => {
    if (!tareas) return [];
    const q = query.trim().toLowerCase();
    if (!q) return tareas;
    return tareas.filter((t) => [t.titulo, t.asignadoANombre, t.departamentoNombre, t.baseLegal].some((v) => v?.toLowerCase().includes(q)));
  }, [tareas, query]);

  const notificacionesNoLeidas = (notificaciones ?? []).filter((n) => !n.leida);

  return (
    <div className="dpo-module">
      <div className="dpo-module-header">
        <div>
          <h2>Tareas de Cumplimiento</h2>
          <p className="dpo-module-subtitle">
            {esRevisor
              ? 'Designa tareas a los jefes de área y revisa si se cumplieron.'
              : 'Tareas de cumplimiento asignadas a tu cargo.'}
          </p>
        </div>
        {esRevisor && (
          <button className="dpo-btn dpo-btn-primary" onClick={abrirCrear}>
            <Icon name="plus" size={16} /> Nueva tarea
          </button>
        )}
      </div>

      {notificacionesNoLeidas.length > 0 && (
        <div className="dpo-card dpo-card-body" style={{ marginBottom: 16, borderColor: 'var(--dpo-warning)' }}>
          <strong style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Icon name="alert-triangle" size={16} /> Recordatorios ({notificacionesNoLeidas.length})
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notificacionesNoLeidas.map((n) => (
              <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span>{n.mensaje}</span>
                <button className="dpo-btn dpo-btn-secondary dpo-btn-sm" onClick={() => marcarNotificacionLeida(n.id)}>
                  Marcar como leída
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dpo-toolbar">
        <div className="dpo-search">
          <Icon name="search" size={16} />
          <input placeholder="Buscar…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {tareas === null ? (
        <TableSkeleton />
      ) : tareasFiltradas.length === 0 ? (
        <div className="dpo-empty">
          <Icon name="check-circle" size={32} />
          <p className="dpo-empty-title">Sin tareas registradas</p>
          <p>{esRevisor ? 'Designa la primera tarea a un jefe de área.' : 'No tienes tareas de cumplimiento asignadas.'}</p>
        </div>
      ) : (
        <div className="dpo-table-wrap">
          <table className="dpo-table">
            <thead>
              <tr>
                <th>Tarea</th>
                <th>Asignado a</th>
                <th>Departamento</th>
                <th>Base legal</th>
                <th>Fecha límite</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tareasFiltradas.map((t) => {
                const info = diasInfo(t.fechaLimite, t.estado);
                const puedeSubirEvidencia = !esRevisor && t.asignadoAId === currentUser?.sub && (t.estado === 'pendiente' || t.estado === 'rechazada');
                return (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.titulo}</strong>
                      {t.estado === 'rechazada' && t.comentarioRevision && (
                        <div className="dpo-muted" style={{ fontSize: '0.78rem', marginTop: 2 }}>Motivo: {t.comentarioRevision}</div>
                      )}
                    </td>
                    <td className="dpo-muted">{t.asignadoANombre}</td>
                    <td className="dpo-muted">{t.departamentoNombre || '—'}</td>
                    <td className="dpo-muted">{t.baseLegal || '—'}</td>
                    <td>
                      <div>{new Date(`${t.fechaLimite}T00:00:00`).toLocaleDateString()}</div>
                      {info && (
                        <div className={`dpo-muted ${info.tono === 'danger' ? 'dpo-text-danger' : ''}`} style={{ fontSize: '0.76rem', color: info.tono === 'danger' ? 'var(--dpo-danger)' : info.tono === 'warning' ? 'var(--dpo-warning)' : undefined }}>
                          {info.text}
                        </div>
                      )}
                    </td>
                    <td><span className={`dpo-badge ${estadoBadge[t.estado]}`}>{estadoLabel[t.estado]}</span></td>
                    <td className="dpo-table-actions">
                      {t.evidenciaUrl && (
                        <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => verEvidencia(t.evidenciaUrl!)} title="Ver evidencia">
                          <Icon name="file-text" size={15} />
                        </button>
                      )}
                      {puedeSubirEvidencia && (
                        <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => { setEvidenciaModal(t); setEvidenciaFile(null); }} title="Subir evidencia">
                          <Icon name="inbox" size={15} />
                        </button>
                      )}
                      {esRevisor && t.estado === 'en_revision' && (
                        <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => { setRevisarModal(t); setRevisarForm({ aprobada: true, comentario: '' }); }} title="Revisar">
                          <Icon name="check-circle" size={15} />
                        </button>
                      )}
                      {esRevisor && t.estado !== 'completada' && (
                        <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => enviarRecordatorio(t)} title="Enviar recordatorio">
                          <Icon name="message" size={15} />
                        </button>
                      )}
                      {esRevisor && (
                        <>
                          <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => abrirEditar(t)} title="Editar">
                            <Icon name="clipboard" size={15} />
                          </button>
                          <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => eliminarTarea(t.id, t.titulo)} title="Eliminar">
                            <Icon name="trash" size={15} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- Modal: crear/editar tarea ---------- */}
      {tareaModal && (
        <Modal title={tareaModal.mode === 'edit' ? 'Editar tarea' : 'Nueva tarea de cumplimiento'} onClose={() => setTareaModal(null)}>
          <form className="dpo-form" onSubmit={guardarTarea}>
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
              <label>Asignar a *</label>
              {(usuarios?.length ?? 0) > 0 ? (
                <select value={form.asignadoAId} onChange={(e) => seleccionarAsignado(e.target.value)} required>
                  <option value="">Selecciona un usuario</option>
                  {(usuarios ?? []).map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} {u.apellidos ?? ''}{u.departamento ? ` — ${u.departamento.nombre}` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="dpo-muted" style={{ fontSize: '0.8rem' }}>
                  No se pudo cargar la lista de usuarios. Ve a "Empresas y Usuarios" para verificar tu acceso.
                </p>
              )}
            </div>
            {form.departamentoNombre && (
              <p className="dpo-muted" style={{ fontSize: '0.8rem', margin: 0 }}>Departamento: {form.departamentoNombre}</p>
            )}
            <div className="dpo-field">
              <label>Título de la tarea *</label>
              <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required placeholder="Ej. Recoger consentimiento firmado" />
            </div>
            <div className="dpo-field">
              <label>Descripción</label>
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Detalle de lo que debe hacer el responsable" />
            </div>
            <div className="dpo-field">
              <label>Base legal / artículo que la justifica</label>
              <select
                value={baseLegalManual ? OTRO_ARTICULO : form.baseLegal}
                onChange={(e) => {
                  if (e.target.value === OTRO_ARTICULO) {
                    setBaseLegalManual(true);
                    setForm({ ...form, baseLegal: '' });
                  } else {
                    setBaseLegalManual(false);
                    setForm({ ...form, baseLegal: e.target.value });
                  }
                }}
              >
                <option value="">Sin especificar</option>
                {ARTICULOS_LOPDP.map((a) => <option key={a} value={a}>{a}</option>)}
                <option value={OTRO_ARTICULO}>{OTRO_ARTICULO}</option>
              </select>
              {baseLegalManual && (
                <input
                  style={{ marginTop: '0.5rem' }}
                  value={form.baseLegal}
                  onChange={(e) => setForm({ ...form, baseLegal: e.target.value })}
                  placeholder="Escribe el artículo u otra base legal"
                  autoFocus
                />
              )}
            </div>
            <div className="dpo-field">
              <label>Fecha límite *</label>
              <input type="date" value={form.fechaLimite} onChange={(e) => setForm({ ...form, fechaLimite: e.target.value })} required />
            </div>
            <div className="dpo-form-actions">
              <button type="button" className="dpo-btn dpo-btn-secondary" onClick={() => setTareaModal(null)}>Cancelar</button>
              <button type="submit" className="dpo-btn dpo-btn-primary" disabled={saving}>
                {saving && <span className="dpo-spinner" />} {tareaModal.mode === 'edit' ? 'Guardar cambios' : 'Asignar tarea'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ---------- Modal: subir evidencia ---------- */}
      {evidenciaModal && (
        <Modal title={`Evidencia — ${evidenciaModal.titulo}`} onClose={() => setEvidenciaModal(null)}>
          <form className="dpo-form" onSubmit={subirEvidencia}>
            <p className="dpo-muted" style={{ margin: 0 }}>
              Sube el documento firmado escaneado (PDF), o una foto/captura de la evidencia (JPG, PNG).
            </p>
            <div className="dpo-field">
              <label>Archivo de evidencia *</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={(e) => setEvidenciaFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="dpo-form-actions">
              <button type="button" className="dpo-btn dpo-btn-secondary" onClick={() => setEvidenciaModal(null)}>Cancelar</button>
              <button type="submit" className="dpo-btn dpo-btn-primary" disabled={saving}>
                {saving && <span className="dpo-spinner" />} Enviar para revisión
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ---------- Modal: revisar tarea (DPO) ---------- */}
      {revisarModal && (
        <Modal title={`Revisar — ${revisarModal.titulo}`} onClose={() => setRevisarModal(null)}>
          <form className="dpo-form" onSubmit={confirmarRevision}>
            <div className="dpo-field">
              <label>Evidencia enviada</label>
              <button type="button" className="dpo-btn dpo-btn-secondary dpo-btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => verEvidencia(revisarModal.evidenciaUrl!)}>
                <Icon name="file-text" size={15} /> Ver archivo
              </button>
            </div>
            <div className="dpo-field">
              <label>¿La tarea se cumplió correctamente?</label>
              <select value={revisarForm.aprobada ? 'si' : 'no'} onChange={(e) => setRevisarForm({ ...revisarForm, aprobada: e.target.value === 'si' })}>
                <option value="si">Sí, aprobar y marcar como completada</option>
                <option value="no">No, rechazar y pedir que se corrija</option>
              </select>
            </div>
            <div className="dpo-field">
              <label>Comentario {!revisarForm.aprobada && '*'}</label>
              <textarea
                value={revisarForm.comentario}
                onChange={(e) => setRevisarForm({ ...revisarForm, comentario: e.target.value })}
                required={!revisarForm.aprobada}
                placeholder="Ej. El documento no tiene firma visible"
              />
            </div>
            <div className="dpo-form-actions">
              <button type="button" className="dpo-btn dpo-btn-secondary" onClick={() => setRevisarModal(null)}>Cancelar</button>
              <button type="submit" className="dpo-btn dpo-btn-primary" disabled={saving}>
                {saving && <span className="dpo-spinner" />} Confirmar
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
