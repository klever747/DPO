import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch, omitEmpty } from './lib/api';
import { Icon } from './ui/Icon';
import { Modal } from './ui/Modal';
import { TableSkeleton } from './ui/Skeleton';
import { ToastProvider, useToast } from './ui/Toast';
import './styles.css';

interface EmpresaRef {
  id: string;
  nombre: string;
}

interface ActividadRef {
  id: string;
  nombreActividad: string;
  empresaId: string;
  categoriasDatos?: string[];
}

interface EvaluacionRiesgo {
  id: string;
  empresaId: string;
  actividadId?: string;
  actividadNombre: string;
  descripcionRiesgo: string;
  probabilidad: number;
  impacto: number;
  nivelRiesgo: 'bajo' | 'medio' | 'alto' | 'critico';
  medidasMitigacion?: string;
  requiereConsultaPrevia: boolean;
  responsableNombre?: string;
  responsableEmail?: string;
  estado: 'pendiente' | 'en_tratamiento' | 'mitigado' | 'aceptado';
  fechaEvaluacion: string;
  fechaReevaluacion?: string;
}

const NIVEL_LABEL: Record<string, string> = { bajo: 'Bajo', medio: 'Medio', alto: 'Alto', critico: 'Crítico' };
const NIVEL_BADGE: Record<string, string> = {
  bajo: 'dpo-badge-success',
  medio: 'dpo-badge-warning',
  alto: 'dpo-badge-primary',
  critico: 'dpo-badge-danger',
};

const ESTADOS = ['pendiente', 'en_tratamiento', 'mitigado', 'aceptado'];
const ESTADO_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  en_tratamiento: 'En tratamiento',
  mitigado: 'Mitigado',
  aceptado: 'Aceptado (riesgo residual asumido)',
};

const ESCALA: { valor: number; label: string }[] = [
  { valor: 1, label: '1 — Muy baja' },
  { valor: 2, label: '2 — Baja' },
  { valor: 3, label: '3 — Media' },
  { valor: 4, label: '4 — Alta' },
  { valor: 5, label: '5 — Muy alta' },
];

/** Misma matriz 5x5 que calcula el backend, para previsualizar el nivel antes de guardar. */
function calcularNivel(probabilidad: number, impacto: number): EvaluacionRiesgo['nivelRiesgo'] {
  const puntaje = probabilidad * impacto;
  if (puntaje <= 4) return 'bajo';
  if (puntaje <= 9) return 'medio';
  if (puntaje <= 15) return 'alto';
  return 'critico';
}

const emptyForm = {
  empresaId: '',
  actividadId: '',
  actividadNombre: '',
  descripcionRiesgo: '',
  probabilidad: 3,
  impacto: 3,
  medidasMitigacion: '',
  requiereConsultaPrevia: false,
  responsableNombre: '',
  responsableEmail: '',
  estado: 'pendiente',
  fechaEvaluacion: new Date().toISOString().slice(0, 10),
  fechaReevaluacion: '',
};

function ModuleContent() {
  const toast = useToast();
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionRiesgo[] | null>(null);
  const [empresas, setEmpresas] = useState<EmpresaRef[] | null>(null);
  const [actividades, setActividades] = useState<ActividadRef[] | null>(null);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; evaluacion?: EvaluacionRiesgo } | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function cargarEvaluaciones() {
    try {
      const res = await apiFetch<{ data: EvaluacionRiesgo[] }>('/evaluaciones-riesgo');
      setEvaluaciones(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar las evaluaciones: ${(err as Error).message}`);
      setEvaluaciones([]);
    }
  }

  async function cargarEmpresas() {
    try {
      const res = await apiFetch<{ data: EmpresaRef[] }>('/empresas');
      setEmpresas(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar las empresas: ${(err as Error).message}`);
      setEmpresas([]);
    }
  }

  async function cargarActividades() {
    try {
      const res = await apiFetch<{ data: ActividadRef[] }>('/actividades');
      setActividades(res.data);
    } catch {
      // Sin acceso al RAT o sin actividades registradas: se permite escribir
      // el nombre de la actividad a mano en el formulario.
      setActividades([]);
    }
  }

  useEffect(() => {
    cargarEvaluaciones();
    cargarEmpresas();
    cargarActividades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const empresasById = useMemo(() => {
    const map = new Map<string, EmpresaRef>();
    (empresas ?? []).forEach((e) => map.set(e.id, e));
    return map;
  }, [empresas]);

  const actividadesDisponibles = useMemo(
    () => (actividades ?? []).filter((a) => !form.empresaId || a.empresaId === form.empresaId),
    [actividades, form.empresaId],
  );

  function abrirCrear() {
    setForm({ ...emptyForm, empresaId: empresas?.length === 1 ? empresas[0].id : '' });
    setModal({ mode: 'create' });
  }

  function abrirEditar(e: EvaluacionRiesgo) {
    setForm({
      empresaId: e.empresaId,
      actividadId: e.actividadId ?? '',
      actividadNombre: e.actividadNombre,
      descripcionRiesgo: e.descripcionRiesgo,
      probabilidad: e.probabilidad,
      impacto: e.impacto,
      medidasMitigacion: e.medidasMitigacion ?? '',
      requiereConsultaPrevia: e.requiereConsultaPrevia,
      responsableNombre: e.responsableNombre ?? '',
      responsableEmail: e.responsableEmail ?? '',
      estado: e.estado,
      fechaEvaluacion: e.fechaEvaluacion,
      fechaReevaluacion: e.fechaReevaluacion ?? '',
    });
    setModal({ mode: 'edit', evaluacion: e });
  }

  function seleccionarActividad(actividadId: string) {
    const act = actividadesDisponibles.find((a) => a.id === actividadId);
    setForm((f) => ({ ...f, actividadId, actividadNombre: act ? act.nombreActividad : f.actividadNombre }));
  }

  async function guardar(ev: FormEvent) {
    ev.preventDefault();
    setSaving(true);
    try {
      const payload = omitEmpty({ ...form, probabilidad: Number(form.probabilidad), impacto: Number(form.impacto) });
      if (modal?.mode === 'edit' && modal.evaluacion) {
        await apiFetch(`/evaluaciones-riesgo/${modal.evaluacion.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        toast.success('Evaluación de riesgo actualizada');
      } else {
        await apiFetch('/evaluaciones-riesgo', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('Evaluación de riesgo registrada');
      }
      setModal(null);
      cargarEvaluaciones();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function eliminar(id: string, nombre: string) {
    if (!confirm(`¿Eliminar la evaluación de riesgo "${nombre}"?`)) return;
    try {
      await apiFetch(`/evaluaciones-riesgo/${id}`, { method: 'DELETE' });
      toast.success('Evaluación eliminada');
      cargarEvaluaciones();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const filtradas = useMemo(() => {
    if (!evaluaciones) return [];
    const q = query.trim().toLowerCase();
    if (!q) return evaluaciones;
    return evaluaciones.filter((e) =>
      [e.actividadNombre, e.descripcionRiesgo, e.nivelRiesgo, e.estado, empresasById.get(e.empresaId)?.nombre].some((v) =>
        v?.toLowerCase().includes(q),
      ),
    );
  }, [evaluaciones, query, empresasById]);

  const nivelPreview = calcularNivel(Number(form.probabilidad), Number(form.impacto));

  return (
    <div className="dpo-module">
      <div className="dpo-module-header">
        <div>
          <h2>Análisis de Riesgo (EIPD)</h2>
          <p className="dpo-module-subtitle">
            Evalúa el riesgo de cada actividad de tratamiento (probabilidad x impacto) y da seguimiento a las medidas de mitigación.
          </p>
        </div>
        <button className="dpo-btn dpo-btn-primary" onClick={abrirCrear}>
          <Icon name="plus" size={16} /> Nueva evaluación
        </button>
      </div>

      <div className="dpo-toolbar">
        <div className="dpo-search">
          <Icon name="search" size={16} />
          <input placeholder="Buscar…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {evaluaciones === null ? (
        <TableSkeleton />
      ) : filtradas.length === 0 ? (
        <div className="dpo-empty">
          <Icon name="alert-triangle" size={32} />
          <p className="dpo-empty-title">Sin evaluaciones de riesgo</p>
          <p>Registra la primera EIPD para una actividad de tratamiento.</p>
        </div>
      ) : (
        <div className="dpo-table-wrap">
          <table className="dpo-table">
            <thead>
              <tr>
                <th>Actividad</th>
                <th>Empresa</th>
                <th>Riesgo</th>
                <th>Estado</th>
                <th>Reevaluación</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((e) => (
                <tr key={e.id}>
                  <td>
                    <strong>{e.actividadNombre}</strong>
                    <div className="dpo-muted" style={{ fontSize: '0.8rem' }}>{e.descripcionRiesgo}</div>
                  </td>
                  <td className="dpo-muted">{empresasById.get(e.empresaId)?.nombre ?? '—'}</td>
                  <td>
                    <span className={`dpo-badge ${NIVEL_BADGE[e.nivelRiesgo]}`}>{NIVEL_LABEL[e.nivelRiesgo]}</span>
                    {e.requiereConsultaPrevia && (
                      <div className="dpo-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        Requiere consulta previa a la SPDP
                      </div>
                    )}
                  </td>
                  <td className="dpo-muted">{ESTADO_LABEL[e.estado]}</td>
                  <td className="dpo-muted">{e.fechaReevaluacion ? new Date(`${e.fechaReevaluacion}T00:00:00`).toLocaleDateString() : '—'}</td>
                  <td className="dpo-table-actions">
                    <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => abrirEditar(e)} title="Editar">
                      <Icon name="clipboard" size={15} />
                    </button>
                    <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => eliminar(e.id, e.actividadNombre)} title="Eliminar">
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
        <Modal title={modal.mode === 'edit' ? 'Editar evaluación de riesgo' : 'Nueva evaluación de riesgo (EIPD)'} onClose={() => setModal(null)}>
          <form className="dpo-form" onSubmit={guardar}>
            {(empresas?.length ?? 0) > 1 && (
              <div className="dpo-field">
                <label>Empresa *</label>
                <select value={form.empresaId} onChange={(e) => setForm({ ...form, empresaId: e.target.value, actividadId: '' })} required>
                  <option value="">Selecciona una empresa</option>
                  {(empresas ?? []).map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
            )}
            {actividadesDisponibles.length > 0 && (
              <div className="dpo-field">
                <label>Actividad del RAT (opcional)</label>
                <select value={form.actividadId} onChange={(e) => seleccionarActividad(e.target.value)}>
                  <option value="">— Escribir manualmente abajo —</option>
                  {actividadesDisponibles.map((a) => <option key={a.id} value={a.id}>{a.nombreActividad}</option>)}
                </select>
              </div>
            )}
            <div className="dpo-field">
              <label>Nombre de la actividad / tratamiento evaluado *</label>
              <input value={form.actividadNombre} onChange={(e) => setForm({ ...form, actividadNombre: e.target.value })} required />
            </div>
            <div className="dpo-field">
              <label>Descripción del riesgo *</label>
              <textarea
                value={form.descripcionRiesgo}
                onChange={(e) => setForm({ ...form, descripcionRiesgo: e.target.value })}
                required
                placeholder="Ej. Acceso no autorizado a datos de salud almacenados en el servidor local"
              />
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Probabilidad *</label>
                <select value={form.probabilidad} onChange={(e) => setForm({ ...form, probabilidad: Number(e.target.value) })}>
                  {ESCALA.map((o) => <option key={o.valor} value={o.valor}>{o.label}</option>)}
                </select>
              </div>
              <div className="dpo-field">
                <label>Impacto *</label>
                <select value={form.impacto} onChange={(e) => setForm({ ...form, impacto: Number(e.target.value) })}>
                  {ESCALA.map((o) => <option key={o.valor} value={o.valor}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div className="dpo-field">
              <label>Nivel de riesgo resultante</label>
              <div>
                <span className={`dpo-badge ${NIVEL_BADGE[nivelPreview]}`}>{NIVEL_LABEL[nivelPreview]}</span>
              </div>
            </div>
            <div className="dpo-field">
              <label>Medidas de mitigación</label>
              <textarea value={form.medidasMitigacion} onChange={(e) => setForm({ ...form, medidasMitigacion: e.target.value })} placeholder="Controles técnicos u organizativos para reducir el riesgo" />
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Responsable (nombre)</label>
                <input value={form.responsableNombre} onChange={(e) => setForm({ ...form, responsableNombre: e.target.value })} />
              </div>
              <div className="dpo-field">
                <label>Responsable (email)</label>
                <input type="email" value={form.responsableEmail} onChange={(e) => setForm({ ...form, responsableEmail: e.target.value })} />
              </div>
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Estado</label>
                <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                  {ESTADOS.map((es) => <option key={es} value={es}>{ESTADO_LABEL[es]}</option>)}
                </select>
              </div>
              <div className="dpo-field">
                <label>Fecha de reevaluación</label>
                <input type="date" value={form.fechaReevaluacion} onChange={(e) => setForm({ ...form, fechaReevaluacion: e.target.value })} />
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={form.requiereConsultaPrevia}
                onChange={(e) => setForm({ ...form, requiereConsultaPrevia: e.target.checked })}
              />
              Requiere consulta previa a la Superintendencia (SPDP) por riesgo residual alto
            </label>
            <div className="dpo-form-actions">
              <button type="button" className="dpo-btn dpo-btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
              <button type="submit" className="dpo-btn dpo-btn-primary" disabled={saving}>
                {saving && <span className="dpo-spinner" />} {modal.mode === 'edit' ? 'Guardar cambios' : 'Registrar evaluación'}
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
