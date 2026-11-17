import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import Avatar from '../components/Avatar.jsx';
import FollowButton from '../components/FollowButton.jsx';
import PostCard from '../components/PostCard.jsx';

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [p, setP] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { setP(null); api(`/users/${id}`).then(setP).catch((e) => setError(e.message)); }, [id, user]);
  if (error) return <p className="error">{error}</p>;
  if (!p) return null;
  const posts = p.posts.map((x) => ({ ...x, author_id: p.id, author_name: p.name, author_headline: p.headline }));
  return (
    <>
      <section className="card profile">
        <Avatar name={p.name} size={88} />
        <div className="profile-info">
          <h1>{p.name}</h1>
          <p className="muted">{p.headline}</p>
          <p>{p.bio}</p>
          <div className="chips">{p.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>
          <p className="links">
            {p.github && <a href={p.github} target="_blank" rel="noreferrer">GitHub</a>}
            {p.website && <a href={p.website} target="_blank" rel="noreferrer">Website</a>}
          </p>
          <p className="stats"><b>{p.followers}</b> followers · <b>{p.following}</b> following · <b>{p.posts.length}</b> posts</p>
        </div>
        <div>
          <FollowButton userId={p.id} initial={p.is_following} onChange={(f) => setP({ ...p, followers: p.followers + (f ? 1 : -1) })} />
          {user?.id === p.id && <Link className="btn ghost" to="/edit-profile">Edit profile</Link>}
        </div>
      </section>
      <h3 className="section">Posts</h3>
      {posts.map((x) => <PostCard key={x.id} post={x} />)}
      {!posts.length && <p className="muted">No posts yet.</p>}
    </>
  );
}
