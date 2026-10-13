
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <NavLink to="/resources" className="brand">
        <span className="brand-icon">D</span>
        <span>DevShelf</span>
      </NavLink>

      <nav className="nav-links">
        <NavLink to="/resources">Resources</NavLink>
        <NavLink to="/snippets">Snippets</NavLink>
        <NavLink to="/tasks">Tasks</NavLink>
      </nav>

      <div className="nav-user">
        <span className="user-name">
          {user?.userName || user?.email || 'Developer'}
        </span>
        <button
          className="button button-outline button-small"
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>
    </header>
  );
}
