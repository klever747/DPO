import { NavLink, Outlet } from 'react-router-dom';
import { modules } from '../routes/moduleRegistry';
import { useAuth } from '../auth/AuthContext';
import { Icon } from '../ui/Icon';

export function Layout() {
  const { user, logout } = useAuth();
  const initials = (user?.email ?? '?').slice(0, 2).toUpperCase();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark">DPO</span>
          <span>Plataforma DPO</span>
        </div>
        <nav>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon name="dashboard" size={17} /> Panel general
          </NavLink>
          {modules.map((m) => (
            <NavLink key={m.path} to={m.path} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon name={m.icon} size={17} /> {m.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="topbar-user">
            <span className="user-avatar">{initials}</span>
            <div>
              <div className="user-email">{user?.email}</div>
              <span className="badge">{user?.rol}</span>
            </div>
          </div>
          <button className="btn-logout" onClick={logout}>
            <Icon name="logout" size={16} /> Salir
          </button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
