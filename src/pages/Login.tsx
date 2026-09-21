import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    try {
      await signIn(email, password);
      navigate('/tasks');
    } catch {
      setError('Email o contraseña incorrectos');
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    try {
      await signInWithGoogle();
      navigate('/tasks');
    } catch {
      setError('No se pudo iniciar sesión con Google');
    }
  }

  return (
    <div>
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Iniciar sesión</button>
      </form>
      <button className="btn-google" onClick={handleGoogleSignIn}>
        Iniciar sesión con Google
      </button>
    </div>
  );
}