import { Link } from 'react-router-dom';

export function Navbar() {
    return (
        <nav>
            <strong>MateCode Tasks</strong>
            {' | '}
            <Link to="/login">Login</Link>
            {' | '}
            <Link to="/register">Register</Link>
            {' | '}
            <Link to="/tasks">Tasks</Link>
        </nav>
    );
}