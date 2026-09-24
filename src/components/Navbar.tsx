import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav>
      <Link to="/" className="navbar-brand">MateCode Tasks</Link>
      <div className="nav-links">
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/tasks">Tasks</Link>
        <Link to="/calendar">Calendario</Link>
      </div>
    </nav>
  );
}