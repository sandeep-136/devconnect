import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import Landing from '../components/Landing.jsx';
import PostCard from '../components/PostCard.jsx';

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [scope, setScope] = useState('all'); // 'all' | 'following'
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  // Re-fetch whenever the tab (scope) or the logged-in user changes.
  useEffect(() => { api(`/posts?scope=${scope}`).then(setPosts).catch((e) => setError(e.message)); }, [scope, user]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const p = await api('/posts', { method: 'POST', body: { content } });
      setPosts([p, ...posts]); // optimistic: show it instantly
      setContent('');
    } catch (err) { setError(err.message); }
  };
  const remove = async (id) => { await api(`/posts/${id}`, { method: 'DELETE' }); setPosts(posts.filter((p) => p.id !== id)); };

  return (
    <>
      {user ? (
        <form className="card composer" onSubmit={submit}>
          <textarea placeholder="Share a tip, a question or what you're building..." value={content} maxLength={500} onChange={(e) => setContent(e.target.value)} />
          <div className="row"><span className="muted">{content.length}/500</span><button className="btn" disabled={!content.trim()}>Post</button></div>
          {error && <p className="error">{error}</p>}
        </form>
      ) : <Landing />}
      <h2 className="page-title">Feed</h2>
      {user && (
        <div className="tabs">
          <button className={scope === 'all' ? 'active' : ''} onClick={() => setScope('all')}>Everyone</button>
          <button className={scope === 'following' ? 'active' : ''} onClick={() => setScope('following')}>Following</button>
        </div>
      )}
      {posts.map((p) => <PostCard key={p.id} post={p} onDelete={remove} />)}
      {!posts.length && <p className="muted center">Nothing here yet.</p>}
    </>
  );
}
