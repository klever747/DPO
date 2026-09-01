import { FormEvent, useEffect, useState } from 'react';
import { apiFetch } from './lib/api';
import './styles.css';

interface Titular {
  id: string;
  nombre: string;
  email?: string;
}

interface Consentimiento {
  id: string;
  titularId: string;
  finalidad: string;
  canal: string;
  estado: string;
  fechaOtorgamiento: string;
}

export default function Module() {
  const [titulares, setTitulares] = useState<Titular[]>([]);
  const [consentimientos, setConsentimientos] = useState<Consentimiento[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [nuevoTitular, setNuevoTitular] = useState({ nombre: '', email: '' });
  const [nuevoConsentimiento, setNuevoConsentimiento] = useState({ titularId: '', finalidad: '', baseLegal: '', canal: 'web' });

  async function cargarTitulares() {
    try {
      const res = await apiFetch<{ data: Titular[] }>('/titulares');
      setTitulares(res.data);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function cargarConsentimientos() {
    try {
      const res = await apiFetch<{ data: Consentimiento[] }>('/consentimientos');
      setConsentimientos(res.data);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    cargarTitulares();
    cargarConsentimientos();
  }, []);

  async function crearTitular(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const empresaId = getEmpresaIdFromToken();
      await apiFetch('/titulares', { method: 'POST', body: JSON.stringify({ ...nuevoTitular, empresaId }) });
      setNuevoTitular({ nombre: '', email: '' });
      cargarTitulares();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function crearConsentimiento(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const empresaId = getEmpresaIdFromToken();
      await apiFetch('/consentimientos', { method: 'POST', body: JSON.stringify({ ...nuevoConsentimiento, empresaId }) });
      setNuevoConsentimiento({ titularId: '', finalidad: '', baseLegal: '', canal: 'web' });
      cargarConsentimientos();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function revocar(id: string) {
    try {
      await apiFetch(`/consentimientos/${id}/revocar`, { method: 'POST' });
      cargarConsentimientos();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="dpo-module">
      <h2>Consentimientos</h2>
      {error && <p className="dpo-error">{error}</p>}

      <h3>Titulares de datos</h3>
      <form className="dpo-form" onSubmit={crearTitular}>
        <input
          placeholder="Nombre"
          value={nuevoTitular.nombre}
          onChange={(e) => setNuevoTitular({ ...nuevoTitular, nombre: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={nuevoTitular.email}
          onChange={(e) => setNuevoTitular({ ...nuevoTitular, email: e.target.value })}
        />
        <button type="submit">Registrar titular</button>
      </form>
      <table className="dpo-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {titulares.map((t) => (
            <tr key={t.id}>
              <td>{t.nombre}</td>
              <td>{t.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Consentimientos</h3>
      <form className="dpo-form" onSubmit={crearConsentimiento}>
        <select
          value={nuevoConsentimiento.titularId}
          onChange={(e) => setNuevoConsentimiento({ ...nuevoConsentimiento, titularId: e.target.value })}
          required
        >
          <option value="">Selecciona titular</option>
          {titulares.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
        <input
          placeholder="Finalidad"
          value={nuevoConsentimiento.finalidad}
          onChange={(e) => setNuevoConsentimiento({ ...nuevoConsentimiento, finalidad: e.target.value })}
          required
        />
        <input
          placeholder="Base legal"
          value={nuevoConsentimiento.baseLegal}
          onChange={(e) => setNuevoConsentimiento({ ...nuevoConsentimiento, baseLegal: e.target.value })}
        />
        <select
          value={nuevoConsentimiento.canal}
          onChange={(e) => setNuevoConsentimiento({ ...nuevoConsentimiento, canal: e.target.value })}
        >
          <option value="web">Web</option>
          <option value="app">App</option>
          <option value="papel">Papel</option>
          <option value="telefono">Teléfono</option>
          <option value="email">Email</option>
          <option value="presencial">Presencial</option>
        </select>
        <button type="submit">Registrar consentimiento</button>
      </form>
      <table className="dpo-table">
        <thead>
          <tr>
            <th>Finalidad</th>
            <th>Canal</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {consentimientos.map((c) => (
            <tr key={c.id}>
              <td>{c.finalidad}</td>
              <td>{c.canal}</td>
              <td>{c.estado}</td>
              <td>{new Date(c.fechaOtorgamiento).toLocaleDateString()}</td>
              <td>
                {c.estado === 'otorgado' && <button onClick={() => revocar(c.id)}>Revocar</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getEmpresaIdFromToken(): string | null {
  const token = localStorage.getItem('dpo_token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.empresaId ?? null;
  } catch {
    return null;
  }
}
