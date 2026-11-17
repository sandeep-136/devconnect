// Right rail: developers you don't follow yet.
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import Avatar from './Avatar.jsx';
import FollowButton from './FollowButton.jsx';

export default function Suggested() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const loc = useLocation(); // refetch on every page change so the rail stays in sync
  useEffect(() => {
    api('/users?q=').then((all) => setList(all.filter((u) => u.id !== user?.id && !u.is_following).slice(0, 4)));
  }, [user, loc.pathname]);
  if (!list.length) return null;
  return (
    <div className="panel">
      <h4>Who to follow</h4>
      {list.map((u) => (
        <div className="mini" key={u.id}>
          <Avatar name={u.name} size={32} />
          <div><Link to={`/profile/${u.id}`}>{u.name}</Link><span>{u.headline}</span></div>
          <FollowButton userId={u.id} initial={false} />
        </div>
      ))}
    </div>
  );
}
