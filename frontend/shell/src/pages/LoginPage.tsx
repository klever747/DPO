import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Icon } from '../ui/Icon';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-brand">
          <span className="login-brand-mark">DPO</span>
          <div>
            <h1>Plataforma DPO</h1>
            <p>Protección de datos, consentimientos, RAT y cumplimiento</p>
          </div>
        </div>
        <ul className="login-features">
          <li><Icon name="shield" size={16} /> Consentimientos y derechos ARCO</li>
          <li><Icon name="clipboard" size={16} /> Registro de Actividades de Tratamiento</li>
          <li><Icon name="alert-triangle" size={16} /> Gestión de brechas de seguridad</li>
        </ul>
      </div>
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Iniciar sesión</h2>
        <p className="login-card-subtitle">Ingresa tus credenciales para continuar</p>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@empresa.com" required autoFocus />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </label>
        {error && (
          <p className="error">
            <Icon name="x-circle" size={15} /> {error}
          </p>
        )}
        <button type="submit" disabled={loading}>
          {loading && <span className="btn-spinner" />} {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
