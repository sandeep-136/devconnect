import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { useAuth } from '../auth.jsx';

const ago = (s) => new Date(s.replace(' ', 'T') + 'Z').toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  return (
    <article className="card post">
      <Avatar name={post.author_name} />
      <div className="post-body">
        <div className="post-head">
          <Link to={`/profile/${post.author_id}`}><strong>{post.author_name}</strong></Link>
          <span className="muted"> {post.author_headline}</span>
          <time>{ago(post.created_at)}</time>
        </div>
        <p>{post.content}</p>
      </div>
      {user?.id === post.author_id && onDelete && <button className="icon-btn" title="Delete" onClick={() => onDelete(post.id)}>✕</button>}
    </article>
  );
}
