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

interface Actividad {
  id: string;
  empresaId: string;
  nombreActividad: string;
  finalidad: string;
  baseLegal: string;
  rolOrganizacion: string;
  responsableTratamiento?: string;
  personaResponsable?: string;
  departamentoPropietario?: string;
  encargadoTratamiento?: string;
  origenDatos?: string;
  categoriasDatos: string[];
  categoriasTitulares: string[];
  tratamientoOcasional: boolean;
  ambitoGeografico?: string;
  volumenTratamientos: string;
  plazoConservacion?: string;
  ejercicioDerechos?: string;
  destinatarios: string[];
  finalidadCesion?: string;
  sistemaInformacion?: string;
  conservacionPapel: boolean;
  almacenamientoLocal: boolean;
  transferenciasInternacionales: boolean;
  paisesDestino: string[];
  garantiasTransferencia?: string;
  medidasSeguridad?: string;
  fechaEvaluacion?: string;
  estado: string;
}

/** Bases legales más habituales (LOPDP / RGPD). */
const BASES_LEGALES = [
  'Consentimiento del titular',
  'Ejecución de un contrato',
  'Cumplimiento de una obligación legal',
  'Protección de intereses vitales',
  'Cumplimiento de una misión de interés público',
  'Interés legítimo del responsable',
  'Otro',
];

const ROLES_ORGANIZACION = [
  { value: 'responsable', label: 'Responsable' },
  { value: 'encargado', label: 'Encargado' },
  { value: 'corresponsable', label: 'Corresponsable' },
];

const VOLUMENES = [
  { value: 'bajo', label: 'Bajo' },
  { value: 'medio', label: 'Medio' },
  { value: 'alto', label: 'Alto' },
];

const emptyForm = {
  empresaId: '',
  nombreActividad: '',
  finalidad: '',
  baseLegal: BASES_LEGALES[0],
  rolOrganizacion: 'responsable',
  responsableTratamiento: '',
  personaResponsable: '',
  departamentoPropietario: '',
  encargadoTratamiento: '',
  origenDatos: '',
  categoriasDatos: '',
  categoriasTitulares: '',
  tratamientoOcasional: false,
  ambitoGeografico: '',
  volumenTratamientos: 'bajo',
  plazoConservacion: '',
  ejercicioDerechos: '',
  destinatarios: '',
  finalidadCesion: '',
  sistemaInformacion: '',
  conservacionPapel: false,
  almacenamientoLocal: false,
  transferenciasInternacionales: false,
  paisesDestino: '',
  garantiasTransferencia: '',
  medidasSeguridad: '',
};

const estadoBadge: Record<string, string> = {
  vigente: 'dpo-badge-success',
  borrador: 'dpo-badge-warning',
  obsoleto: 'dpo-badge-neutral',
};

function csvToArray(s: string): string[] {
  return s.split(',').map((v) => v.trim()).filter(Boolean);
}

function SectionTitle({ children }: { children: string }) {
  return <h4 className="dpo-form-section-title">{children}</h4>;
}

function ModuleContent() {
  const toast = useToast();
  const [empresas, setEmpresas] = useState<EmpresaRef[] | null>(null);
  const [actividades, setActividades] = useState<Actividad[] | null>(null);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState<{ mode: 'create' | 'edit' | 'view'; actividad?: Actividad } | null>(null);
  const [form, setForm] = useState(emptyForm);
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
      const res = await apiFetch<{ data: Actividad[] }>('/actividades');
      setActividades(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar las actividades: ${(err as Error).message}`);
      setActividades([]);
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
    setModal({ mode: 'create' });
  }

  function abrirEditar(a: Actividad) {
    setForm({
      empresaId: a.empresaId,
      nombreActividad: a.nombreActividad,
      finalidad: a.finalidad,
      baseLegal: a.baseLegal || BASES_LEGALES[0],
      rolOrganizacion: a.rolOrganizacion || 'responsable',
      responsableTratamiento: a.responsableTratamiento ?? '',
      personaResponsable: a.personaResponsable ?? '',
      departamentoPropietario: a.departamentoPropietario ?? '',
      encargadoTratamiento: a.encargadoTratamiento ?? '',
      origenDatos: a.origenDatos ?? '',
      categoriasDatos: (a.categoriasDatos ?? []).join(', '),
      categoriasTitulares: (a.categoriasTitulares ?? []).join(', '),
      tratamientoOcasional: a.tratamientoOcasional ?? false,
      ambitoGeografico: a.ambitoGeografico ?? '',
      volumenTratamientos: a.volumenTratamientos || 'bajo',
      plazoConservacion: a.plazoConservacion ?? '',
      ejercicioDerechos: a.ejercicioDerechos ?? '',
      destinatarios: (a.destinatarios ?? []).join(', '),
      finalidadCesion: a.finalidadCesion ?? '',
      sistemaInformacion: a.sistemaInformacion ?? '',
      conservacionPapel: a.conservacionPapel ?? false,
      almacenamientoLocal: a.almacenamientoLocal ?? false,
      transferenciasInternacionales: a.transferenciasInternacionales ?? false,
      paisesDestino: (a.paisesDestino ?? []).join(', '),
      garantiasTransferencia: a.garantiasTransferencia ?? '',
      medidasSeguridad: a.medidasSeguridad ?? '',
    });
    setModal({ mode: 'edit', actividad: a });
  }

  function abrirVer(a: Actividad) {
    setModal({ mode: 'view', actividad: a });
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!form.empresaId) {
      toast.error('Selecciona la empresa de la actividad');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        categoriasDatos: csvToArray(form.categoriasDatos),
        categoriasTitulares: csvToArray(form.categoriasTitulares),
        destinatarios: csvToArray(form.destinatarios),
        paisesDestino: csvToArray(form.paisesDestino),
      };
      if (modal?.mode === 'edit' && modal.actividad) {
        await apiFetch(`/actividades/${modal.actividad.id}`, { method: 'PATCH', body: JSON.stringify(omitEmpty(payload)) });
        toast.success('Actividad actualizada');
      } else {
        await apiFetch('/actividades', { method: 'POST', body: JSON.stringify(omitEmpty(payload)) });
        toast.success(`Actividad "${form.nombreActividad}" registrada`);
      }
      setForm(emptyForm);
      setModal(null);
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
    return actividades.filter((a) => [a.nombreActividad, a.finalidad, a.baseLegal, a.departamentoPropietario].some((v) => v?.toLowerCase().includes(q)));
  }, [actividades, query]);

  return (
    <div className="dpo-module">
      <div className="dpo-module-header">
        <div>
          <h2>Registro de Actividades de Tratamiento (RAT)</h2>
          <p className="dpo-module-subtitle">Documenta cada actividad de tratamiento de datos personales de la organización.</p>
        </div>
        <button className="dpo-btn dpo-btn-primary" onClick={abrirCrear}>
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
              <tr>
                <th>Organización</th>
                <th>Tratamiento de datos</th>
                <th>Legitimación</th>
                <th>Rol organización</th>
                <th>Categorías de datos</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((a) => (
                <tr key={a.id}>
                  <td>{empresasById.get(a.empresaId)?.nombre ?? '—'}</td>
                  <td><strong>{a.nombreActividad}</strong></td>
                  <td>{a.baseLegal}</td>
                  <td className="dpo-muted">{ROLES_ORGANIZACION.find((r) => r.value === a.rolOrganizacion)?.label ?? '—'}</td>
                  <td className="dpo-muted">{a.categoriasDatos?.join(', ') || '—'}</td>
                  <td><span className={`dpo-badge ${estadoBadge[a.estado] ?? 'dpo-badge-neutral'}`}>{a.estado}</span></td>
                  <td className="dpo-table-actions">
                    <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => abrirVer(a)} title="Ver detalle">
                      <Icon name="search" size={15} />
                    </button>
                    <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => abrirEditar(a)} title="Editar">
                      <Icon name="clipboard" size={15} />
                    </button>
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

      {modal && modal.mode === 'view' && modal.actividad && (
        <Modal title="Detalle de la actividad" onClose={() => setModal(null)}>
          <div className="dpo-form">
            {(() => {
              const a = modal.actividad!;
              const row = (label: string, value?: string | null) => (
                <div className="dpo-form-row" key={label}>
                  <div className="dpo-field"><label>{label}</label><p>{value || '—'}</p></div>
                </div>
              );
              return (
                <>
                  {row('Organización', empresasById.get(a.empresaId)?.nombre)}
                  {row('Tratamiento de datos', a.nombreActividad)}
                  {row('Rol de la organización', ROLES_ORGANIZACION.find((r) => r.value === a.rolOrganizacion)?.label)}
                  {row('Identificación / responsable tratamiento', a.responsableTratamiento)}
                  {row('Persona responsable', a.personaResponsable)}
                  {row('Departamento propietario', a.departamentoPropietario)}
                  {row('Encargado del tratamiento', a.encargadoTratamiento)}
                  {row('Origen de los datos', a.origenDatos)}
                  {row('Finalidades del tratamiento', a.finalidad)}
                  {row('Legitimación del tratamiento', a.baseLegal)}
                  {row('Categorías de datos', a.categoriasDatos?.join(', '))}
                  {row('Categoría de interesados', a.categoriasTitulares?.join(', '))}
                  {row('Tratamiento ocasional', a.tratamientoOcasional ? 'Sí' : 'No')}
                  {row('Ámbito geográfico', a.ambitoGeografico)}
                  {row('Volumen de tratamientos', VOLUMENES.find((v) => v.value === a.volumenTratamientos)?.label)}
                  {row('Plazo de conservación', a.plazoConservacion)}
                  {row('Ejercicio de derechos', a.ejercicioDerechos)}
                  {row('Destinatarios', a.destinatarios?.join(', '))}
                  {row('Finalidad de la cesión', a.finalidadCesion)}
                  {row('Sistema de información', a.sistemaInformacion)}
                  {row('Conservación de papel', a.conservacionPapel ? 'Sí' : 'No')}
                  {row('Almacenamiento en local', a.almacenamientoLocal ? 'Sí' : 'No')}
                  {row('Transferencias internacionales', a.transferenciasInternacionales ? 'Sí' : 'No')}
                  {a.transferenciasInternacionales && row('Países de destino', a.paisesDestino?.join(', '))}
                  {a.transferenciasInternacionales && row('Garantías de la transferencia', a.garantiasTransferencia)}
                  {row('Medidas de seguridad', a.medidasSeguridad)}
                  {row('Estado', a.estado)}
                </>
              );
            })()}
            <div className="dpo-form-actions">
              <button type="button" className="dpo-btn dpo-btn-secondary" onClick={() => setModal(null)}>Cerrar</button>
              <button type="button" className="dpo-btn dpo-btn-primary" onClick={() => abrirEditar(modal.actividad!)}>Editar</button>
            </div>
          </div>
        </Modal>
      )}

      {modal && modal.mode !== 'view' && (
        <Modal title={modal.mode === 'edit' ? 'Editar actividad de tratamiento' : 'Nueva actividad de tratamiento'} onClose={() => setModal(null)}>
          <form className="dpo-form" onSubmit={guardar}>
            <SectionTitle>Datos generales</SectionTitle>
            {(empresas?.length ?? 0) > 1 && (
              <div className="dpo-field">
                <label>Organización (empresa) *</label>
                <select value={form.empresaId} onChange={(e) => setForm({ ...form, empresaId: e.target.value })} required>
                  <option value="">Selecciona una empresa</option>
                  {(empresas ?? []).map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
            )}
            <div className="dpo-field">
              <label>Tratamiento de datos *</label>
              <input value={form.nombreActividad} onChange={(e) => setForm({ ...form, nombreActividad: e.target.value })} required placeholder="Ej. Gestión de nómina" />
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Rol de la organización</label>
                <select value={form.rolOrganizacion} onChange={(e) => setForm({ ...form, rolOrganizacion: e.target.value })}>
                  {ROLES_ORGANIZACION.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="dpo-field">
                <label>Departamento propietario</label>
                <input value={form.departamentoPropietario} onChange={(e) => setForm({ ...form, departamentoPropietario: e.target.value })} placeholder="Ej. Recursos Humanos" />
              </div>
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Identificación / responsable tratamiento</label>
                <input value={form.responsableTratamiento} onChange={(e) => setForm({ ...form, responsableTratamiento: e.target.value })} placeholder="Entidad responsable" />
              </div>
              <div className="dpo-field">
                <label>Persona responsable</label>
                <input value={form.personaResponsable} onChange={(e) => setForm({ ...form, personaResponsable: e.target.value })} placeholder="Nombre de la persona" />
              </div>
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Encargado del tratamiento</label>
                <input value={form.encargadoTratamiento} onChange={(e) => setForm({ ...form, encargadoTratamiento: e.target.value })} placeholder="Proveedor / tercero" />
              </div>
              <div className="dpo-field">
                <label>Origen de los datos</label>
                <input value={form.origenDatos} onChange={(e) => setForm({ ...form, origenDatos: e.target.value })} placeholder="Ej. Titular directo" />
              </div>
            </div>

            <SectionTitle>Finalidad y legitimación</SectionTitle>
            <div className="dpo-field">
              <label>Finalidades del tratamiento *</label>
              <textarea value={form.finalidad} onChange={(e) => setForm({ ...form, finalidad: e.target.value })} required />
            </div>
            <div className="dpo-field">
              <label>Legitimación del tratamiento</label>
              <select value={form.baseLegal} onChange={(e) => setForm({ ...form, baseLegal: e.target.value })}>
                {BASES_LEGALES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <SectionTitle>Datos e interesados</SectionTitle>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Categorías de datos (separadas por coma)</label>
                <input value={form.categoriasDatos} onChange={(e) => setForm({ ...form, categoriasDatos: e.target.value })} placeholder="identificativos, bancarios" />
              </div>
              <div className="dpo-field">
                <label>Categoría de interesados (separadas por coma)</label>
                <input value={form.categoriasTitulares} onChange={(e) => setForm({ ...form, categoriasTitulares: e.target.value })} placeholder="empleados, clientes" />
              </div>
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Ámbito geográfico</label>
                <input value={form.ambitoGeografico} onChange={(e) => setForm({ ...form, ambitoGeografico: e.target.value })} placeholder="Local, nacional, internacional…" />
              </div>
              <div className="dpo-field">
                <label>Volumen de tratamientos</label>
                <select value={form.volumenTratamientos} onChange={(e) => setForm({ ...form, volumenTratamientos: e.target.value })}>
                  {VOLUMENES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <div className="dpo-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="rat-ocasional" checked={form.tratamientoOcasional} onChange={(e) => setForm({ ...form, tratamientoOcasional: e.target.checked })} style={{ width: 'auto' }} />
              <label htmlFor="rat-ocasional" style={{ margin: 0 }}>Tratamiento ocasional</label>
            </div>

            <SectionTitle>Conservación y ejercicio de derechos</SectionTitle>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Plazo de conservación</label>
                <input value={form.plazoConservacion} onChange={(e) => setForm({ ...form, plazoConservacion: e.target.value })} placeholder="Ej. 5 años" />
              </div>
              <div className="dpo-field">
                <label>Sistema de información</label>
                <input value={form.sistemaInformacion} onChange={(e) => setForm({ ...form, sistemaInformacion: e.target.value })} placeholder="Ej. SAP, CRM propio" />
              </div>
            </div>
            <div className="dpo-field">
              <label>Ejercicio de derechos</label>
              <textarea value={form.ejercicioDerechos} onChange={(e) => setForm({ ...form, ejercicioDerechos: e.target.value })} placeholder="Cómo puede el titular ejercer sus derechos ARCO" />
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="rat-papel" checked={form.conservacionPapel} onChange={(e) => setForm({ ...form, conservacionPapel: e.target.checked })} style={{ width: 'auto' }} />
                <label htmlFor="rat-papel" style={{ margin: 0 }}>Conservación de papel</label>
              </div>
              <div className="dpo-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="rat-local" checked={form.almacenamientoLocal} onChange={(e) => setForm({ ...form, almacenamientoLocal: e.target.checked })} style={{ width: 'auto' }} />
                <label htmlFor="rat-local" style={{ margin: 0 }}>Almacenamiento en local</label>
              </div>
            </div>

            <SectionTitle>Destinatarios y cesiones</SectionTitle>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Destinatarios (separados por coma)</label>
                <input value={form.destinatarios} onChange={(e) => setForm({ ...form, destinatarios: e.target.value })} placeholder="entidad bancaria, aseguradora" />
              </div>
              <div className="dpo-field">
                <label>Finalidad de la cesión</label>
                <input value={form.finalidadCesion} onChange={(e) => setForm({ ...form, finalidadCesion: e.target.value })} placeholder="Motivo de la cesión a terceros" />
              </div>
            </div>
            <div className="dpo-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                id="rat-transf"
                checked={form.transferenciasInternacionales}
                onChange={(e) => setForm({ ...form, transferenciasInternacionales: e.target.checked })}
                style={{ width: 'auto' }}
              />
              <label htmlFor="rat-transf" style={{ margin: 0 }}>Hay transferencias internacionales</label>
            </div>
            {form.transferenciasInternacionales && (
              <div className="dpo-form-row">
                <div className="dpo-field">
                  <label>Países de destino (separados por coma)</label>
                  <input value={form.paisesDestino} onChange={(e) => setForm({ ...form, paisesDestino: e.target.value })} />
                </div>
                <div className="dpo-field">
                  <label>Garantías de la transferencia</label>
                  <input value={form.garantiasTransferencia} onChange={(e) => setForm({ ...form, garantiasTransferencia: e.target.value })} />
                </div>
              </div>
            )}

            <SectionTitle>Seguridad</SectionTitle>
            <div className="dpo-field">
              <label>Medidas de seguridad</label>
              <textarea value={form.medidasSeguridad} onChange={(e) => setForm({ ...form, medidasSeguridad: e.target.value })} />
            </div>

            <div className="dpo-form-actions">
              <button type="button" className="dpo-btn dpo-btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
              <button type="submit" className="dpo-btn dpo-btn-primary" disabled={saving}>
                {saving && <span className="dpo-spinner" />} {modal.mode === 'edit' ? 'Guardar cambios' : 'Registrar'}
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
