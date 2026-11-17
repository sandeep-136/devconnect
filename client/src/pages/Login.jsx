import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

// One form, two modes (log in / sign up).
export default function Login() {
  const { login, signup } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await signup(form.name, form.email, form.password);
      nav('/');
    } catch (err) { setError(err.message); }
  };

  return (
    <form className="card auth" onSubmit={submit}>
      <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
      {mode === 'signup' && <input placeholder="Full name" value={form.name} onChange={set('name')} required />}
      <input type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
      <input type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={set('password')} required />
      {error && <p className="error">{error}</p>}
      <button className="btn">{mode === 'login' ? 'Log in' : 'Sign up'}</button>
      <p className="muted center">
        {mode === 'login' ? 'New here? ' : 'Already have an account? '}
        <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === 'login' ? 'signup' : 'login'); }}>{mode === 'login' ? 'Sign up' : 'Log in'}</a>
      </p>
      {mode === 'login' && <p className="muted center small">Demo: aarav@demo.dev / password123</p>}
    </form>
  );
}
