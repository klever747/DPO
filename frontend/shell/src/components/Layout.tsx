import { NavLink, Outlet } from 'react-router-dom';
import { modules } from '../routes/moduleRegistry';
import { useAuth } from '../auth/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">Plataforma DPO</div>
        <nav>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Panel general
          </NavLink>
          {modules.map((m) => (
            <NavLink key={m.path} to={m.path} className={({ isActive }) => (isActive ? 'active' : '')}>
              {m.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <span>{user?.email}</span>
          <span className="badge">{user?.rol}</span>
          <button onClick={logout}>Salir</button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
