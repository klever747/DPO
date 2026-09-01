import { FormEvent, useEffect, useState } from 'react';
import { apiFetch } from './lib/api';
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

export default function Module() {
  const [tab, setTab] = useState<'empresas' | 'usuarios'>('empresas');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [nuevaEmpresa, setNuevaEmpresa] = useState({ nombre: '', nif: '', sector: '', pais: '', dpoEmail: '' });
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', email: '', password: '', empresaId: '' });

  async function cargarEmpresas() {
    try {
      const res = await apiFetch<{ data: Empresa[] }>('/empresas');
      setEmpresas(res.data);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function cargarUsuarios() {
    try {
      const res = await apiFetch<{ data: Usuario[] }>('/usuarios');
      setUsuarios(res.data);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    cargarEmpresas();
    cargarUsuarios();
  }, []);

  async function crearEmpresa(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch('/empresas', { method: 'POST', body: JSON.stringify(nuevaEmpresa) });
      setNuevaEmpresa({ nombre: '', nif: '', sector: '', pais: '', dpoEmail: '' });
      cargarEmpresas();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function crearUsuario(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch('/usuarios', {
        method: 'POST',
        body: JSON.stringify({ ...nuevoUsuario, empresaId: nuevoUsuario.empresaId || undefined }),
      });
      setNuevoUsuario({ nombre: '', email: '', password: '', empresaId: '' });
      cargarUsuarios();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="dpo-module">
      <h2>Empresas y Usuarios</h2>
      {error && <p className="dpo-error">{error}</p>}

      <div className="dpo-tabs">
        <button className={tab === 'empresas' ? 'active' : ''} onClick={() => setTab('empresas')}>
          Empresas
        </button>
        <button className={tab === 'usuarios' ? 'active' : ''} onClick={() => setTab('usuarios')}>
          Usuarios
        </button>
      </div>

      {tab === 'empresas' && (
        <div>
          <form className="dpo-form" onSubmit={crearEmpresa}>
            <input
              placeholder="Nombre de la empresa"
              value={nuevaEmpresa.nombre}
              onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, nombre: e.target.value })}
              required
            />
            <input
              placeholder="NIF"
              value={nuevaEmpresa.nif}
              onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, nif: e.target.value })}
            />
            <input
              placeholder="Sector"
              value={nuevaEmpresa.sector}
              onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, sector: e.target.value })}
            />
            <input
              placeholder="País"
              value={nuevaEmpresa.pais}
              onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, pais: e.target.value })}
            />
            <input
              placeholder="Email del DPO"
              value={nuevaEmpresa.dpoEmail}
              onChange={(e) => setNuevaEmpresa({ ...nuevaEmpresa, dpoEmail: e.target.value })}
            />
            <button type="submit">Crear empresa</button>
          </form>

          <table className="dpo-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>NIF</th>
                <th>Sector</th>
                <th>País</th>
                <th>DPO</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map((e) => (
                <tr key={e.id}>
                  <td>{e.nombre}</td>
                  <td>{e.nif}</td>
                  <td>{e.sector}</td>
                  <td>{e.pais}</td>
                  <td>{e.dpoEmail}</td>
                  <td>{e.activo ? 'Activa' : 'Inactiva'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'usuarios' && (
        <div>
          <form className="dpo-form" onSubmit={crearUsuario}>
            <input
              placeholder="Nombre"
              value={nuevoUsuario.nombre}
              onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={nuevoUsuario.email}
              onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={nuevoUsuario.password}
              onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
              required
              minLength={8}
            />
            <select
              value={nuevoUsuario.empresaId}
              onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, empresaId: e.target.value })}
            >
              <option value="">Sin empresa (super admin)</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
            <button type="submit">Crear usuario</button>
          </form>

          <table className="dpo-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>
                    {u.nombre} {u.apellidos}
                  </td>
                  <td>{u.email}</td>
                  <td>{u.rol}</td>
                  <td>{u.activo ? 'Activo' : 'Inactivo'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
