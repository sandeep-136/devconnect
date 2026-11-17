import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import Avatar from '../components/Avatar.jsx';
import FollowButton from '../components/FollowButton.jsx';
import { useAuth } from '../auth.jsx';

export default function Developers() {
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [list, setList] = useState([]);
  useEffect(() => { api(`/users?q=${encodeURIComponent(q)}`).then(setList); }, [q, user]);
  return (
    <>
      <h2 className="page-title">Developers</h2>
      <input placeholder="Search by name, skill or headline (e.g. React)" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="dev-list">
        {list.map((u) => (
          <div className="card dev" key={u.id}>
            <Avatar name={u.name} size={50} />
            <div className="dev-info">
              <Link to={`/profile/${u.id}`}><h3>{u.name}</h3></Link>
              <p className="muted">{u.headline}</p>
              <div className="chips">{u.skills.slice(0, 4).map((s) => <span key={s} className="chip">{s}</span>)}</div>
            </div>
            <FollowButton userId={u.id} initial={u.is_following} />
          </div>
        ))}
      </div>
    </>
  );
}
