import { FormEvent, useEffect, useState } from 'react';
import { apiFetch } from './lib/api';
import './styles.css';

interface Actividad {
  id: string;
  nombreActividad: string;
  finalidad: string;
  baseLegal: string;
  estado: string;
  categoriasDatos: string[];
  destinatarios: string[];
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

export default function Module() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombreActividad: '',
    finalidad: '',
    baseLegal: '',
    categoriasDatos: '',
    destinatarios: '',
  });

  async function cargar() {
    try {
      const res = await apiFetch<{ data: Actividad[] }>('/actividades');
      setActividades(res.data);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crear(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const empresaId = getEmpresaIdFromToken();
      await apiFetch('/actividades', {
        method: 'POST',
        body: JSON.stringify({
          empresaId,
          nombreActividad: form.nombreActividad,
          finalidad: form.finalidad,
          baseLegal: form.baseLegal,
          categoriasDatos: form.categoriasDatos.split(',').map((s) => s.trim()).filter(Boolean),
          destinatarios: form.destinatarios.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      setForm({ nombreActividad: '', finalidad: '', baseLegal: '', categoriasDatos: '', destinatarios: '' });
      cargar();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="dpo-module">
      <h2>Registro de Actividades de Tratamiento (RAT)</h2>
      {error && <p className="dpo-error">{error}</p>}

      <form className="dpo-form" onSubmit={crear}>
        <input
          placeholder="Nombre de la actividad"
          value={form.nombreActividad}
          onChange={(e) => setForm({ ...form, nombreActividad: e.target.value })}
          required
        />
        <input
          placeholder="Finalidad"
          value={form.finalidad}
          onChange={(e) => setForm({ ...form, finalidad: e.target.value })}
          required
        />
        <input
          placeholder="Base legal"
          value={form.baseLegal}
          onChange={(e) => setForm({ ...form, baseLegal: e.target.value })}
          required
        />
        <input
          placeholder="Categorías de datos (separadas por coma)"
          value={form.categoriasDatos}
          onChange={(e) => setForm({ ...form, categoriasDatos: e.target.value })}
        />
        <input
          placeholder="Destinatarios (separados por coma)"
          value={form.destinatarios}
          onChange={(e) => setForm({ ...form, destinatarios: e.target.value })}
        />
        <button type="submit">Registrar actividad</button>
      </form>

      <table className="dpo-table">
        <thead>
          <tr>
            <th>Actividad</th>
            <th>Finalidad</th>
            <th>Base legal</th>
            <th>Categorías de datos</th>
            <th>Destinatarios</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {actividades.map((a) => (
            <tr key={a.id}>
              <td>{a.nombreActividad}</td>
              <td>{a.finalidad}</td>
              <td>{a.baseLegal}</td>
              <td>{a.categoriasDatos?.join(', ')}</td>
              <td>{a.destinatarios?.join(', ')}</td>
              <td>{a.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
