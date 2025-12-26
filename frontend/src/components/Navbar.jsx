import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="navbar">
      <div className="navbar__brand">SaaS Manager</div>
      <nav className="navbar__links">
        <Link to="/">Dashboard</Link>
        <Link to="/projects">Projects</Link>
        {user.role === 'tenant_admin' && <Link to="/users">Users</Link>}
      </nav>
      <div className="navbar__user">
        <div className="navbar__user-meta">
          <span className="navbar__user-name">{user.fullName}</span>
          <span className="navbar__user-role">{user.role}</span>
        </div>
        <button className="btn btn-ghost" onClick={logout}>Logout</button>
      </div>
    </header>
  );
};

export default Navbar;
