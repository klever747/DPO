import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch, omitEmpty } from './lib/api';
import { Icon } from './ui/Icon';
import { Modal } from './ui/Modal';
import { TableSkeleton } from './ui/Skeleton';
import { ToastProvider, useToast } from './ui/Toast';
import './styles.css';

interface Empresa {
  id: string;
  nombre: string;
  nif?: string;
  sector?: string;
  pais?: string;
  dpoEmail?: string;
  activo: boolean;
}

interface Usuario {
  id: string;
  nombre: string;
  apellidos?: string;
  email: string;
  rol: string;
  empresaId?: string;
  activo: boolean;
}

const emptyEmpresa = { nombre: '', nif: '', sector: '', pais: '', dpoEmail: '' };
const emptyUsuario = { nombre: '', email: '', password: '', empresaId: '' };

function ModuleContent() {
  const toast = useToast();
  const [tab, setTab] = useState<'empresas' | 'usuarios'>('empresas');
  const [empresas, setEmpresas] = useState<Empresa[] | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null);
  const [query, setQuery] = useState('');
  const [showEmpresaModal, setShowEmpresaModal] = useState(false);
  const [showUsuarioModal, setShowUsuarioModal] = useState(false);
  const [nuevaEmpresa, setNuevaEmpresa] = useState(emptyEmpresa);
  const [nuevoUsuario, setNuevoUsuario] = useState(emptyUsuario);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    cargarEmpresas();
    cargarUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function crearEmpresa(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/empresas', { method: 'POST', body: JSON.stringify(omitEmpty(nuevaEmpresa)) });
      toast.success(`Empresa "${nuevaEmpresa.nombre}" creada correctamente`);
      setNuevaEmpresa(emptyEmpresa);
      setShowEmpresaModal(false);
      cargarEmpresas();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function crearUsuario(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/usuarios', {
        method: 'POST',
        body: JSON.stringify(omitEmpty({ ...nuevoUsuario, empresaId: nuevoUsuario.empresaId || undefined })),
      });
      toast.success(`Usuario "${nuevoUsuario.nombre}" creado correctamente`);
      setNuevoUsuario(emptyUsuario);
      setShowUsuarioModal(false);
      cargarUsuarios();
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

  const empresasFiltradas = useMemo(() => {
    if (!empresas) return [];
    const q = query.trim().toLowerCase();
    if (!q) return empresas;
    return empresas.filter((e) => [e.nombre, e.nif, e.sector, e.pais].some((v) => v?.toLowerCase().includes(q)));
  }, [empresas, query]);

  const usuariosFiltrados = useMemo(() => {
    if (!usuarios) return [];
    const q = query.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) => [u.nombre, u.apellidos, u.email, u.rol].some((v) => v?.toLowerCase().includes(q)));
  }, [usuarios, query]);

  return (
    <div className="dpo-module">
      <div className="dpo-module-header">
        <div>
          <h2>Empresas y Usuarios</h2>
          <p className="dpo-module-subtitle">Administra las organizaciones y las cuentas que acceden a la plataforma.</p>
        </div>
        <button
          className="dpo-btn dpo-btn-primary"
          onClick={() => (tab === 'empresas' ? setShowEmpresaModal(true) : setShowUsuarioModal(true))}
        >
          <Icon name="plus" size={16} /> {tab === 'empresas' ? 'Nueva empresa' : 'Nuevo usuario'}
        </button>
      </div>

      <div className="dpo-tabs">
        <button className={tab === 'empresas' ? 'active' : ''} onClick={() => setTab('empresas')}>
          <Icon name="building" size={15} /> Empresas
        </button>
        <button className={tab === 'usuarios' ? 'active' : ''} onClick={() => setTab('usuarios')}>
          <Icon name="users" size={15} /> Usuarios
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
                  <th>NIF</th>
                  <th>Sector</th>
                  <th>País</th>
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
                    <td>{e.sector || '—'}</td>
                    <td>{e.pais || '—'}</td>
                    <td>{e.dpoEmail || '—'}</td>
                    <td>
                      <span className={`dpo-badge ${e.activo ? 'dpo-badge-success' : 'dpo-badge-neutral'}`}>
                        {e.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="dpo-table-actions">
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
            <p>Crea usuarios y asígnalos a una empresa con el rol adecuado.</p>
          </div>
        ) : (
          <div className="dpo-table-wrap">
            <table className="dpo-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
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
                    <td>
                      <span className={`dpo-badge ${u.activo ? 'dpo-badge-success' : 'dpo-badge-neutral'}`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="dpo-table-actions">
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

      {showEmpresaModal && (
        <Modal title="Nueva empresa" onClose={() => setShowEmpresaModal(false)}>
          <form className="dpo-form" onSubmit={crearEmpresa}>
            <div className="dpo-field">
              <label>Nombre *</label>
              <input value={nuevaEmpresa.nombre} onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, nombre: e.target.value })} required />
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>NIF</label>
                <input value={nuevaEmpresa.nif} onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, nif: e.target.value })} />
              </div>
              <div className="dpo-field">
                <label>Sector</label>
                <input value={nuevaEmpresa.sector} onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, sector: e.target.value })} />
              </div>
            </div>
            <div className="dpo-form-row">
              <div className="dpo-field">
                <label>País</label>
                <input value={nuevaEmpresa.pais} onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, pais: e.target.value })} />
              </div>
              <div className="dpo-field">
                <label>Email del DPO</label>
                <input type="email" value={nuevaEmpresa.dpoEmail} onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, dpoEmail: e.target.value })} />
              </div>
            </div>
            <div className="dpo-form-actions">
              <button type="button" className="dpo-btn dpo-btn-secondary" onClick={() => setShowEmpresaModal(false)}>Cancelar</button>
              <button type="submit" className="dpo-btn dpo-btn-primary" disabled={saving}>
                {saving && <span className="dpo-spinner" />} Crear empresa
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showUsuarioModal && (
        <Modal title="Nuevo usuario" onClose={() => setShowUsuarioModal(false)}>
          <form className="dpo-form" onSubmit={crearUsuario}>
            <div className="dpo-field">
              <label>Nombre *</label>
              <input value={nuevoUsuario.nombre} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })} required />
            </div>
            <div className="dpo-field">
              <label>Email *</label>
              <input type="email" value={nuevoUsuario.email} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })} required />
            </div>
            <div className="dpo-field">
              <label>Contraseña *</label>
              <input type="password" minLength={8} value={nuevoUsuario.password} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })} required />
            </div>
            <div className="dpo-field">
              <label>Empresa</label>
              <select value={nuevoUsuario.empresaId} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, empresaId: e.target.value })}>
                <option value="">Sin empresa (super admin)</option>
                {(empresas ?? []).map((e) => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </select>
            </div>
            <div className="dpo-form-actions">
              <button type="button" className="dpo-btn dpo-btn-secondary" onClick={() => setShowUsuarioModal(false)}>Cancelar</button>
              <button type="submit" className="dpo-btn dpo-btn-primary" disabled={saving}>
                {saving && <span className="dpo-spinner" />} Crear usuario
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
