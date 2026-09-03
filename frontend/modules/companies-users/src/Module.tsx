import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch, omitEmpty } from './lib/api';
import { Icon } from './ui/Icon';
import { Modal } from './ui/Modal';
import { TableSkeleton } from './ui/Skeleton';
import { ToastProvider, useToast } from './ui/Toast';
import './styles.css';

/** Debe coincidir con MODULE_CATALOG de @dpo/common (backend). */
const MODULE_CATALOG = [
  { key: 'empresas-usuarios', label: 'Empresas y Usuarios' },
  { key: 'consentimientos', label: 'Consentimientos' },
  { key: 'rat', label: 'Registro de Actividades (RAT)' },
  { key: 'arco', label: 'Derechos ARCO' },
  { key: 'brechas', label: 'Brechas de Seguridad' },
  { key: 'retencion', label: 'Plazos de Retención' },
  { key: 'canal-etico', label: 'Canal Ético' },
  { key: 'madurez', label: 'Madurez' },
  { key: 'formacion', label: 'Formación' },
  { key: 'contratos', label: 'Plantillas de Contratos' },
  { key: 'auditoria', label: 'Auditoría' },
  { key: 'evidencias', label: 'Evidencias' },
];

const ROLES = ['super_admin', 'admin_empresa', 'dpo', 'gestor', 'auditor', 'empleado'];

interface EmpresaRef {
  id: string;
  nombre: string;
}

interface Empresa extends EmpresaRef {
  nif?: string;
  ruc?: string;
  sector?: string;
  pais?: string;
  representanteLegal?: string;
  dpoEmail?: string;
  activo: boolean;
}

interface DepartamentoRef {
  id: string;
  nombre: string;
}

interface Usuario {
  id: string;
  nombre: string;
  apellidos?: string;
  email: string;
  rol: string;
  activo: boolean;
  modulosPermitidos: string[];
  empresas: EmpresaRef[];
  departamento?: DepartamentoRef | null;
  ultimoAcceso?: string;
  createdAt: string;
}

interface Sector {
  id: string;
  nombre: string;
  activo: boolean;
}

interface Departamento {
  id: string;
  empresaId: string;
  nombre: string;
  activo: boolean;
}

const emptyEmpresaForm = { nombre: '', nif: '', ruc: '', sector: '', pais: '', representanteLegal: '', dpoEmail: '' };
const emptyUsuarioForm = {
  nombre: '',
  apellidos: '',
  email: '',
  password: '',
  rol: 'empleado',
  activo: true,
  empresaIds: [] as string[],
  modulosPermitidos: [] as string[],
  departamentoId: '',
};
const emptySectorForm = { nombre: '' };
const emptyDepartamentoForm = { empresaId: '', nombre: '' };

function ModuleContent() {
  const toast = useToast();
  const [tab, setTab] = useState<'empresas' | 'usuarios' | 'departamentos' | 'sectores'>('empresas');
  const [empresas, setEmpresas] = useState<Empresa[] | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null);
  const [sectores, setSectores] = useState<Sector[] | null>(null);
  const [departamentos, setDepartamentos] = useState<Departamento[] | null>(null);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  // --- Empresas ---
  const [empresaModal, setEmpresaModal] = useState<{ mode: 'create' | 'edit'; empresa?: Empresa } | null>(null);
  const [nuevaEmpresa, setNuevaEmpresa] = useState(emptyEmpresaForm);

  // --- Usuarios ---
  const [usuarioModal, setUsuarioModal] = useState<{ mode: 'create' | 'edit' | 'view'; usuario?: Usuario } | null>(null);
  const [usuarioForm, setUsuarioForm] = useState(emptyUsuarioForm);

  // --- Sectores ---
  const [showSectorModal, setShowSectorModal] = useState<{ mode: 'create' | 'edit'; sector?: Sector } | null>(null);
  const [sectorForm, setSectorForm] = useState(emptySectorForm);

  // --- Departamentos ---
  const [departamentoModal, setDepartamentoModal] = useState<{ mode: 'create' | 'edit'; departamento?: Departamento } | null>(null);
  const [departamentoForm, setDepartamentoForm] = useState(emptyDepartamentoForm);

  async function cargarEmpresas() {
    try {
      const res = await apiFetch<{ data: Empresa[] }>('/empresas');
      setEmpresas(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar las empresas: ${(err as Error).message}`);
      setEmpresas([]);
    }
  }

  async function cargarUsuarios() {
    try {
      const res = await apiFetch<{ data: Usuario[] }>('/usuarios');
      setUsuarios(res.data);
    } catch (err) {
      toast.error(`No se pudieron cargar los usuarios: ${(err as Error).message}`);
      setUsuarios([]);
    }
  }

  async function cargarSectores() {
    try {
      const res = await apiFetch<Sector[]>('/sectores');
      setSectores(res);
    } catch (err) {
      toast.error(`No se pudieron cargar los sectores: ${(err as Error).message}`);
      setSectores([]);
    }
  }

  async function cargarDepartamentos() {
    try {
      const res = await apiFetch<Departamento[]>('/departamentos');
      setDepartamentos(res);
    } catch (err) {
      toast.error(`No se pudieron cargar los departamentos: ${(err as Error).message}`);
      setDepartamentos([]);
    }
  }

  useEffect(() => {
    cargarEmpresas();
    cargarUsuarios();
    cargarSectores();
    cargarDepartamentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const empresasById = useMemo(() => {
    const map = new Map<string, Empresa>();
    (empresas ?? []).forEach((e) => map.set(e.id, e));
    return map;
  }, [empresas]);

  // ===================== Empresas =====================

  function abrirCrearEmpresa() {
    setNuevaEmpresa(emptyEmpresaForm);
    setEmpresaModal({ mode: 'create' });
  }

  function abrirEditarEmpresa(e: Empresa) {
    setNuevaEmpresa({
      nombre: e.nombre,
      nif: e.nif ?? '',
      ruc: e.ruc ?? '',
      sector: e.sector ?? '',
      pais: e.pais ?? '',
      representanteLegal: e.representanteLegal ?? '',
      dpoEmail: e.dpoEmail ?? '',
    });
    setEmpresaModal({ mode: 'edit', empresa: e });
  }

  async function guardarEmpresa(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (empresaModal?.mode === 'edit' && empresaModal.empresa) {
        await apiFetch(`/empresas/${empresaModal.empresa.id}`, {
          method: 'PATCH',
          body: JSON.stringify(omitEmpty(nuevaEmpresa)),
        });
        toast.success('Empresa actualizada correctamente');
      } else {
        await apiFetch('/empresas', { method: 'POST', body: JSON.stringify(omitEmpty(nuevaEmpresa)) });
        toast.success(`Empresa "${nuevaEmpresa.nombre}" creada correctamente`);
      }
      setNuevaEmpresa(emptyEmpresaForm);
      setEmpresaModal(null);
      cargarEmpresas();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function eliminarEmpresa(id: string, nombre: string) {
    if (!confirm(`¿Eliminar la empresa "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await apiFetch(`/empresas/${id}`, { method: 'DELETE' });
      toast.success('Empresa eliminada');
      cargarEmpresas();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  // ===================== Usuarios =====================

  function abrirCrearUsuario() {
    setUsuarioForm(emptyUsuarioForm);
    setUsuarioModal({ mode: 'create' });
  }

  function abrirEditarUsuario(u: Usuario) {
    setUsuarioForm({
      nombre: u.nombre,
      apellidos: u.apellidos ?? '',
      email: u.email,
      password: '',
      rol: u.rol,
      activo: u.activo,
      empresaIds: u.empresas.map((e) => e.id),
      modulosPermitidos: u.modulosPermitidos ?? [],
      departamentoId: u.departamento?.id ?? '',
    });
    setUsuarioModal({ mode: 'edit', usuario: u });
  }

  function abrirVerUsuario(u: Usuario) {
    setUsuarioModal({ mode: 'view', usuario: u });
  }

  function toggleEmpresaEnForm(empresaId: string) {
    setUsuarioForm((f) => {
      const empresaIds = f.empresaIds.includes(empresaId)
        ? f.empresaIds.filter((id) => id !== empresaId)
        : [...f.empresaIds, empresaId];
      const departamentoActual = (departamentos ?? []).find((d) => d.id === f.departamentoId);
      const departamentoId = departamentoActual && !empresaIds.includes(departamentoActual.empresaId) ? '' : f.departamentoId;
      return { ...f, empresaIds, departamentoId };
    });
  }

  function toggleModuloEnForm(moduleKey: string) {
    setUsuarioForm((f) => ({
      ...f,
      modulosPermitidos: f.modulosPermitidos.includes(moduleKey)
        ? f.modulosPermitidos.filter((k) => k !== moduleKey)
        : [...f.modulosPermitidos, moduleKey],
    }));
  }

  async function guardarUsuario(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (usuarioModal?.mode === 'edit' && usuarioModal.usuario) {
        const { password, ...rest } = usuarioForm;
        await apiFetch(`/usuarios/${usuarioModal.usuario.id}`, {
          method: 'PATCH',
          body: JSON.stringify(omitEmpty({ ...rest, password: password || undefined })),
        });
        toast.success('Usuario actualizado correctamente');
      } else {
        await apiFetch('/usuarios', { method: 'POST', body: JSON.stringify(omitEmpty(usuarioForm)) });
        toast.success(`Usuario "${usuarioForm.nombre}" creado correctamente`);
      }
      setUsuarioModal(null);
      cargarUsuarios();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function eliminarUsuario(id: string, nombre: string) {
    if (!confirm(`¿Eliminar al usuario "${nombre}"?`)) return;
    try {
      await apiFetch(`/usuarios/${id}`, { method: 'DELETE' });
      toast.success('Usuario eliminado');
      cargarUsuarios();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  // ===================== Sectores =====================

  function abrirCrearSector() {
    setSectorForm(emptySectorForm);
    setShowSectorModal({ mode: 'create' });
  }

  function abrirEditarSector(s: Sector) {
    setSectorForm({ nombre: s.nombre });
    setShowSectorModal({ mode: 'edit', sector: s });
  }

  async function guardarSector(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (showSectorModal?.mode === 'edit' && showSectorModal.sector) {
        await apiFetch(`/sectores/${showSectorModal.sector.id}`, {
          method: 'PATCH',
          body: JSON.stringify(sectorForm),
        });
        toast.success('Sector actualizado');
      } else {
        await apiFetch('/sectores', { method: 'POST', body: JSON.stringify(sectorForm) });
        toast.success(`Sector "${sectorForm.nombre}" creado`);
      }
      setShowSectorModal(null);
      cargarSectores();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function eliminarSector(id: string, nombre: string) {
    if (!confirm(`¿Eliminar el sector "${nombre}"? Las empresas que ya lo usan conservarán el nombre, pero dejará de estar disponible para elegir.`)) return;
    try {
      await apiFetch(`/sectores/${id}`, { method: 'DELETE' });
      toast.success('Sector eliminado');
      cargarSectores();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  // ===================== Departamentos =====================

  function abrirCrearDepartamento() {
    setDepartamentoForm({ ...emptyDepartamentoForm, empresaId: empresas?.length === 1 ? empresas[0].id : '' });
    setDepartamentoModal({ mode: 'create' });
  }

  function abrirEditarDepartamento(d: Departamento) {
    setDepartamentoForm({ empresaId: d.empresaId, nombre: d.nombre });
    setDepartamentoModal({ mode: 'edit', departamento: d });
  }

  async function guardarDepartamento(e: FormEvent) {
    e.preventDefault();
    if (!departamentoForm.empresaId) {
      toast.error('Selecciona la empresa del departamento');
      return;
    }
    setSaving(true);
    try {
      if (departamentoModal?.mode === 'edit' && departamentoModal.departamento) {
        await apiFetch(`/departamentos/${departamentoModal.departamento.id}`, {
          method: 'PATCH',
          body: JSON.stringify(departamentoForm),
        });
        toast.success('Departamento actualizado');
      } else {
        await apiFetch('/departamentos', { method: 'POST', body: JSON.stringify(departamentoForm) });
        toast.success(`Departamento "${departamentoForm.nombre}" creado`);
      }
      setDepartamentoModal(null);
      cargarDepartamentos();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function eliminarDepartamento(id: string, nombre: string) {
    if (!confirm(`¿Eliminar el departamento "${nombre}"? Los usuarios asignados quedarán sin departamento.`)) return;
    try {
      await apiFetch(`/departamentos/${id}`, { method: 'DELETE' });
      toast.success('Departamento eliminado');
      cargarDepartamentos();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  // ===================== Filtros de búsqueda =====================

  const empresasFiltradas = useMemo(() => {
    if (!empresas) return [];
    const q = query.trim().toLowerCase();
    if (!q) return empresas;
    return empresas.filter((e) => [e.nombre, e.nif, e.ruc, e.sector, e.pais, e.representanteLegal].some((v) => v?.toLowerCase().includes(q)));
  }, [empresas, query]);

  const usuariosFiltrados = useMemo(() => {
    if (!usuarios) return [];
    const q = query.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) => [u.nombre, u.apellidos, u.email, u.rol].some((v) => v?.toLowerCase().includes(q)));
  }, [usuarios, query]);

  const sectoresFiltrados = useMemo(() => {
    if (!sectores) return [];
    const q = query.trim().toLowerCase();
    if (!q) return sectores;
    return sectores.filter((s) => s.nombre.toLowerCase().includes(q));
  }, [sectores, query]);

  const departamentosFiltrados = useMemo(() => {
    if (!departamentos) return [];
    const q = query.trim().toLowerCase();
    if (!q) return departamentos;
    return departamentos.filter((d) => [d.nombre, empresasById.get(d.empresaId)?.nombre].some((v) => v?.toLowerCase().includes(q)));
  }, [departamentos, query, empresasById]);

  return (
    <div className="dpo-module">
      <div className="dpo-module-header">
        <div>
          <h2>Empresas y Usuarios</h2>
          <p className="dpo-module-subtitle">Administra organizaciones, cuentas de acceso y el catálogo de sectores.</p>
        </div>
        {tab === 'empresas' && (
          <button className="dpo-btn dpo-btn-primary" onClick={abrirCrearEmpresa}>
            <Icon name="plus" size={16} /> Nueva empresa
          </button>
        )}
        {tab === 'usuarios' && (
          <button className="dpo-btn dpo-btn-primary" onClick={abrirCrearUsuario}>
            <Icon name="plus" size={16} /> Nuevo usuario
          </button>
        )}
        {tab === 'departamentos' && (
          <button className="dpo-btn dpo-btn-primary" onClick={abrirCrearDepartamento}>
            <Icon name="plus" size={16} /> Nuevo departamento
          </button>
        )}
        {tab === 'sectores' && (
          <button className="dpo-btn dpo-btn-primary" onClick={abrirCrearSector}>
            <Icon name="plus" size={16} /> Nuevo sector
          </button>
        )}
      </div>

      <div className="dpo-tabs">
        <button className={tab === 'empresas' ? 'active' : ''} onClick={() => setTab('empresas')}>
          <Icon name="building" size={15} /> Empresas
        </button>
        <button className={tab === 'usuarios' ? 'active' : ''} onClick={() => setTab('usuarios')}>
          <Icon name="users" size={15} /> Usuarios
        </button>
        <button className={tab === 'departamentos' ? 'active' : ''} onClick={() => setTab('departamentos')}>
          <Icon name="inbox" size={15} /> Departamentos
        </button>
        <button className={tab === 'sectores' ? 'active' : ''} onClick={() => setTab('sectores')}>
          <Icon name="archive" size={15} /> Sectores
        </button>
      </div>

      <div className="dpo-toolbar">
        <div className="dpo-search">
          <Icon name="search" size={16} />
          <input placeholder="Buscar…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {tab === 'empresas' &&
        (empresas === null ? (
          <TableSkeleton />
        ) : empresasFiltradas.length === 0 ? (
          <div className="dpo-empty">
            <Icon name="building" size={32} />
            <p className="dpo-empty-title">Sin empresas todavía</p>
            <p>Crea la primera empresa para empezar a gestionar el cumplimiento.</p>
          </div>
        ) : (
          <div className="dpo-table-wrap">
            <table className="dpo-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Código</th>
                  <th>RUC</th>
                  <th>Sector</th>
                  <th>País</th>
                  <th>Representante legal</th>
                  <th>DPO</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {empresasFiltradas.map((e) => (
                  <tr key={e.id}>
                    <td><strong>{e.nombre}</strong></td>
                    <td>{e.nif || '—'}</td>
                    <td>{e.ruc || '—'}</td>
                    <td>{e.sector || '—'}</td>
                    <td>{e.pais || '—'}</td>
                    <td>{e.representanteLegal || '—'}</td>
                    <td>{e.dpoEmail || '—'}</td>
                    <td>
                      <span className={`dpo-badge ${e.activo ? 'dpo-badge-success' : 'dpo-badge-neutral'}`}>
                        {e.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="dpo-table-actions">
                      <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => abrirEditarEmpresa(e)} title="Editar">
                        <Icon name="clipboard" size={15} />
                      </button>
                      <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => eliminarEmpresa(e.id, e.nombre)} title="Eliminar">
                        <Icon name="trash" size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {tab === 'usuarios' &&
        (usuarios === null ? (
          <TableSkeleton />
        ) : usuariosFiltrados.length === 0 ? (
          <div className="dpo-empty">
            <Icon name="users" size={32} />
            <p className="dpo-empty-title">Sin usuarios todavía</p>
            <p>Crea usuarios, asígnalos a una o varias empresas y define qué módulos pueden ver.</p>
          </div>
        ) : (
          <div className="dpo-table-wrap">
            <table className="dpo-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Empresas</th>
                  <th>Departamento</th>
                  <th>Módulos</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.nombre} {u.apellidos}</strong></td>
                    <td>{u.email}</td>
                    <td><span className="dpo-badge dpo-badge-primary">{u.rol}</span></td>
                    <td className="dpo-muted">
                      {u.rol === 'super_admin' ? 'Todas' : u.empresas.map((e) => e.nombre).join(', ') || '—'}
                    </td>
                    <td className="dpo-muted">{u.departamento?.nombre ?? '—'}</td>
                    <td className="dpo-muted">
                      {u.rol === 'super_admin' ? 'Todos' : `${u.modulosPermitidos?.length ?? 0} módulo(s)`}
                    </td>
                    <td>
                      <span className={`dpo-badge ${u.activo ? 'dpo-badge-success' : 'dpo-badge-neutral'}`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="dpo-table-actions">
                      <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => abrirVerUsuario(u)} title="Ver información">
                        <Icon name="search" size={15} />
                      </button>
                      <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => abrirEditarUsuario(u)} title="Editar">
                        <Icon name="clipboard" size={15} />
                      </button>
                      <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => eliminarUsuario(u.id, u.nombre)} title="Eliminar">
                        <Icon name="trash" size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {tab === 'departamentos' &&
        (departamentos === null ? (
          <TableSkeleton />
        ) : departamentosFiltrados.length === 0 ? (
          <div className="dpo-empty">
            <Icon name="inbox" size={32} />
            <p className="dpo-empty-title">Sin departamentos todavía</p>
            <p>Crea los departamentos de cada empresa para poder asignarlos a los usuarios.</p>
          </div>
        ) : (
          <div className="dpo-table-wrap">
            <table className="dpo-table">
              <thead>
                <tr><th>Nombre</th><th>Empresa</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                {departamentosFiltrados.map((d) => (
                  <tr key={d.id}>
                    <td><strong>{d.nombre}</strong></td>
                    <td className="dpo-muted">{empresasById.get(d.empresaId)?.nombre ?? '—'}</td>
                    <td><span className={`dpo-badge ${d.activo ? 'dpo-badge-success' : 'dpo-badge-neutral'}`}>{d.activo ? 'Activo' : 'Inactivo'}</span></td>
                    <td className="dpo-table-actions">
                      <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => abrirEditarDepartamento(d)} title="Editar">
                        <Icon name="clipboard" size={15} />
                      </button>
                      <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => eliminarDepartamento(d.id, d.nombre)} title="Eliminar">
                        <Icon name="trash" size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {tab === 'sectores' &&
        (sectores === null ? (
          <TableSkeleton />
        ) : sectoresFiltrados.length === 0 ? (
          <div className="dpo-empty">
            <Icon name="archive" size={32} />
            <p className="dpo-empty-title">Sin sectores todavía</p>
            <p>Crea sectores para que aparezcan en el selector al registrar una empresa.</p>
          </div>
        ) : (
          <div className="dpo-table-wrap">
            <table className="dpo-table">
              <thead>
                <tr><th>Nombre</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                {sectoresFiltrados.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.nombre}</strong></td>
                    <td><span className={`dpo-badge ${s.activo ? 'dpo-badge-success' : 'dpo-badge-neutral'}`}>{s.activo ? 'Activo' : 'Inactivo'}</span></td>
                    <td className="dpo-table-actions">
                      <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => abrirEditarSector(s)} title="Editar">
                        <Icon name="clipboard" size={15} />
                      </button>
                      <button className="dpo-btn dpo-btn-ghost dpo-btn-sm" onClick={() => eliminarSector(s.id, s.nombre)} title="Eliminar">
                        <Icon name="trash" size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {/* ---------- Modal: crear/editar empresa ---------- */}
      {empresaModal && (
        <Modal title={empresaModal.mode === 'edit' ? 'Editar empresa' : 'Nueva empresa'} onClose={() => setEmpresaModal(null)}>
          <form className="dpo-form" onSubmit={guardarEmpresa}>
            <div className="dpo-field">
              <label>Nombre *</label>
              <input value={nuevaEmpresa.nombre} onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, nombre: e.target.value })} required />
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>RUC</label>
                <input
                  value={nuevaEmpresa.ruc}
                  onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, ruc: e.target.value.replace(/\D/g, '') })}
                  inputMode="numeric"
                  maxLength={13}
                  placeholder="13 dígitos, ej. 1790012345001"
                />
              </div>
              <div className="dpo-field">
                <label>Código interno de la empresa</label>
                <input value={nuevaEmpresa.nif} onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, nif: e.target.value })} placeholder="Ej. REITZ-03" />
              </div>
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>Sector</label>
                <select value={nuevaEmpresa.sector} onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, sector: e.target.value })}>
                  <option value="">Selecciona un sector…</option>
                  {(sectores ?? []).filter((s) => s.activo).map((s) => (
                    <option key={s.id} value={s.nombre}>{s.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="dpo-field">
                <label>País</label>
                <input value={nuevaEmpresa.pais} onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, pais: e.target.value })} />
              </div>
            </div>
            <div className="dpo-field">
              <label>Representante legal</label>
              <input value={nuevaEmpresa.representanteLegal} onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, representanteLegal: e.target.value })} placeholder="Nombre completo" />
            </div>
            <div className="dpo-field">
              <label>Email del DPO</label>
              <input type="email" value={nuevaEmpresa.dpoEmail} onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, dpoEmail: e.target.value })} />
            </div>
            <p className="dpo-muted" style={{ fontSize: '0.8rem', margin: 0 }}>
              ¿No está el sector que necesitas? Ve a la pestaña "Sectores" para crearlo.
            </p>
            <div className="dpo-form-actions">
              <button type="button" className="dpo-btn dpo-btn-secondary" onClick={() => setEmpresaModal(null)}>Cancelar</button>
              <button type="submit" className="dpo-btn dpo-btn-primary" disabled={saving}>
                {saving && <span className="dpo-spinner" />} {empresaModal.mode === 'edit' ? 'Guardar cambios' : 'Crear empresa'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ---------- Modal: crear/editar/ver usuario ---------- */}
      {usuarioModal && (
        <Modal
          title={usuarioModal.mode === 'create' ? 'Nuevo usuario' : usuarioModal.mode === 'edit' ? 'Editar usuario' : 'Información del usuario'}
          onClose={() => setUsuarioModal(null)}
        >
          {usuarioModal.mode === 'view' && usuarioModal.usuario ? (
            <div className="dpo-form">
              <div className="dpo-form-row">
                <div className="dpo-field"><label>Nombre</label><p>{usuarioModal.usuario.nombre} {usuarioModal.usuario.apellidos}</p></div>
                <div className="dpo-field"><label>Email</label><p>{usuarioModal.usuario.email}</p></div>
              </div>
              <div className="dpo-form-row">
                <div className="dpo-field"><label>Rol</label><p><span className="dpo-badge dpo-badge-primary">{usuarioModal.usuario.rol}</span></p></div>
                <div className="dpo-field">
                  <label>Estado</label>
                  <p><span className={`dpo-badge ${usuarioModal.usuario.activo ? 'dpo-badge-success' : 'dpo-badge-neutral'}`}>{usuarioModal.usuario.activo ? 'Activo' : 'Inactivo'}</span></p>
                </div>
              </div>
              <div className="dpo-field">
                <label>Empresas</label>
                <p>{usuarioModal.usuario.rol === 'super_admin' ? 'Todas (super_admin)' : (usuarioModal.usuario.empresas.map((e) => e.nombre).join(', ') || 'Ninguna asignada')}</p>
              </div>
              <div className="dpo-field">
                <label>Departamento</label>
                <p>{usuarioModal.usuario.departamento?.nombre ?? 'Sin departamento'}</p>
              </div>
              <div className="dpo-field">
                <label>Módulos permitidos</label>
                {usuarioModal.usuario.rol === 'super_admin' ? (
                  <p>Todos (super_admin)</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(usuarioModal.usuario.modulosPermitidos ?? []).length === 0 && <p className="dpo-muted">Ninguno asignado</p>}
                    {usuarioModal.usuario.modulosPermitidos?.map((k) => (
                      <span key={k} className="dpo-badge dpo-badge-neutral">{MODULE_CATALOG.find((m) => m.key === k)?.label ?? k}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="dpo-form-row">
                <div className="dpo-field"><label>Creado</label><p className="dpo-muted">{new Date(usuarioModal.usuario.createdAt).toLocaleString()}</p></div>
                <div className="dpo-field"><label>Último acceso</label><p className="dpo-muted">{usuarioModal.usuario.ultimoAcceso ? new Date(usuarioModal.usuario.ultimoAcceso).toLocaleString() : 'Nunca'}</p></div>
              </div>
              <div className="dpo-form-actions">
                <button type="button" className="dpo-btn dpo-btn-secondary" onClick={() => setUsuarioModal(null)}>Cerrar</button>
                <button type="button" className="dpo-btn dpo-btn-primary" onClick={() => abrirEditarUsuario(usuarioModal.usuario!)}>Editar</button>
              </div>
            </div>
          ) : (
            <form className="dpo-form" onSubmit={guardarUsuario}>
              <div className="dpo-form-row">
                <div className="dpo-field">
                  <label>Nombre *</label>
                  <input value={usuarioForm.nombre} onChange={(e) => setUsuarioForm({ ...usuarioForm, nombre: e.target.value })} required />
                </div>
                <div className="dpo-field">
                  <label>Apellidos</label>
                  <input value={usuarioForm.apellidos} onChange={(e) => setUsuarioForm({ ...usuarioForm, apellidos: e.target.value })} />
                </div>
              </div>
              <div className="dpo-field">
                <label>Email *</label>
                <input type="email" value={usuarioForm.email} onChange={(e) => setUsuarioForm({ ...usuarioForm, email: e.target.value })} required />
              </div>
              <div className="dpo-field">
                <label>{usuarioModal.mode === 'edit' ? 'Nueva contraseña (dejar en blanco para no cambiarla)' : 'Contraseña *'}</label>
                <input
                  type="password"
                  minLength={8}
                  value={usuarioForm.password}
                  onChange={(e) => setUsuarioForm({ ...usuarioForm, password: e.target.value })}
                  required={usuarioModal.mode === 'create'}
                />
              </div>
              <div className="dpo-form-row">
                <div className="dpo-field">
                  <label>Rol</label>
                  <select value={usuarioForm.rol} onChange={(e) => setUsuarioForm({ ...usuarioForm, rol: e.target.value })}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="dpo-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20 }}>
                  <input type="checkbox" id="usuario-activo" checked={usuarioForm.activo} onChange={(e) => setUsuarioForm({ ...usuarioForm, activo: e.target.checked })} style={{ width: 'auto' }} />
                  <label htmlFor="usuario-activo" style={{ margin: 0 }}>Usuario activo</label>
                </div>
              </div>

              <div className="dpo-field">
                <label>Empresas a las que pertenece {usuarioForm.rol === 'super_admin' && <span className="dpo-muted">(super_admin ve todas, esta selección es opcional)</span>}</label>
                <div className="dpo-checklist">
                  {(empresas ?? []).length === 0 && <p className="dpo-muted">No hay empresas creadas todavía.</p>}
                  {(empresas ?? []).map((e) => (
                    <label key={e.id} className="dpo-checklist-item">
                      <input type="checkbox" checked={usuarioForm.empresaIds.includes(e.id)} onChange={() => toggleEmpresaEnForm(e.id)} />
                      {e.nombre}
                    </label>
                  ))}
                </div>
              </div>

              <div className="dpo-field">
                <label>Departamento</label>
                <select value={usuarioForm.departamentoId} onChange={(e) => setUsuarioForm({ ...usuarioForm, departamentoId: e.target.value })}>
                  <option value="">Sin departamento</option>
                  {(departamentos ?? [])
                    .filter((d) => usuarioForm.empresaIds.includes(d.empresaId))
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nombre}{usuarioForm.empresaIds.length > 1 ? ` (${empresasById.get(d.empresaId)?.nombre})` : ''}
                      </option>
                    ))}
                </select>
                {usuarioForm.empresaIds.length === 0 && (
                  <p className="dpo-muted" style={{ fontSize: '0.78rem', margin: '4px 0 0' }}>
                    Selecciona primero al menos una empresa para ver sus departamentos.
                  </p>
                )}
              </div>

              <div className="dpo-field">
                <label>Módulos que puede ver {usuarioForm.rol === 'super_admin' && <span className="dpo-muted">(super_admin ve todos, esta selección es opcional)</span>}</label>
                <div className="dpo-checklist">
                  {MODULE_CATALOG.map((m) => (
                    <label key={m.key} className="dpo-checklist-item">
                      <input type="checkbox" checked={usuarioForm.modulosPermitidos.includes(m.key)} onChange={() => toggleModuloEnForm(m.key)} />
                      {m.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="dpo-form-actions">
                <button type="button" className="dpo-btn dpo-btn-secondary" onClick={() => setUsuarioModal(null)}>Cancelar</button>
                <button type="submit" className="dpo-btn dpo-btn-primary" disabled={saving}>
                  {saving && <span className="dpo-spinner" />} {usuarioModal.mode === 'edit' ? 'Guardar cambios' : 'Crear usuario'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* ---------- Modal: crear/editar sector ---------- */}
      {showSectorModal && (
        <Modal title={showSectorModal.mode === 'edit' ? 'Editar sector' : 'Nuevo sector'} onClose={() => setShowSectorModal(null)}>
          <form className="dpo-form" onSubmit={guardarSector}>
            <div className="dpo-field">
              <label>Nombre *</label>
              <input value={sectorForm.nombre} onChange={(e) => setSectorForm({ nombre: e.target.value })} required minLength={2} />
            </div>
            <div className="dpo-form-actions">
              <button type="button" className="dpo-btn dpo-btn-secondary" onClick={() => setShowSectorModal(null)}>Cancelar</button>
              <button type="submit" className="dpo-btn dpo-btn-primary" disabled={saving}>
                {saving && <span className="dpo-spinner" />} {showSectorModal.mode === 'edit' ? 'Guardar cambios' : 'Crear sector'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ---------- Modal: crear/editar departamento ---------- */}
      {departamentoModal && (
        <Modal title={departamentoModal.mode === 'edit' ? 'Editar departamento' : 'Nuevo departamento'} onClose={() => setDepartamentoModal(null)}>
          <form className="dpo-form" onSubmit={guardarDepartamento}>
            <div className="dpo-field">
              <label>Empresa *</label>
              <select value={departamentoForm.empresaId} onChange={(e) => setDepartamentoForm({ ...departamentoForm, empresaId: e.target.value })} required>
                <option value="">Selecciona una empresa</option>
                {(empresas ?? []).map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
            <div className="dpo-field">
              <label>Nombre *</label>
              <input value={departamentoForm.nombre} onChange={(e) => setDepartamentoForm({ ...departamentoForm, nombre: e.target.value })} required minLength={2} placeholder="Ej. Recursos Humanos" />
            </div>
            <div className="dpo-form-actions">
              <button type="button" className="dpo-btn dpo-btn-secondary" onClick={() => setDepartamentoModal(null)}>Cancelar</button>
              <button type="submit" className="dpo-btn dpo-btn-primary" disabled={saving}>
                {saving && <span className="dpo-spinner" />} {departamentoModal.mode === 'edit' ? 'Guardar cambios' : 'Crear departamento'}
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
