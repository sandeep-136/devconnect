import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ ...user, skills: user.skills.join(', ') });
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    try {
      const updated = await api('/users/me', { method: 'PUT', body: { ...f, skills: f.skills.split(',') } });
      setUser(updated);
      nav(`/profile/${user.id}`);
    } catch (err) { setError(err.message); }
  };
  return (
    <form className="card auth" onSubmit={save}>
      <h2>Edit profile</h2>
      <input placeholder="Name" value={f.name} onChange={set('name')} required />
      <input placeholder="Headline (e.g. Frontend developer)" value={f.headline} onChange={set('headline')} />
      <textarea placeholder="Bio" value={f.bio} onChange={set('bio')} />
      <input placeholder="Skills, comma separated" value={f.skills} onChange={set('skills')} />
      <input placeholder="GitHub URL" value={f.github} onChange={set('github')} />
      <input placeholder="Website URL" value={f.website} onChange={set('website')} />
      {error && <p className="error">{error}</p>}
      <button className="btn">Save</button>
    </form>
  );
}
