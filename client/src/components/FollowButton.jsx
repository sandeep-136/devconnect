import { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

// Toggles follow/unfollow. Hidden for logged-out visitors and for your own profile.
export default function FollowButton({ userId, initial, onChange }) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(initial);
  if (!user || user.id === userId) return null;
  const toggle = async () => {
    const r = await api(`/users/${userId}/follow`, { method: following ? 'DELETE' : 'POST' });
    setFollowing(r.following);
    onChange?.(r.following);
  };
  return <button className={following ? 'btn ghost' : 'btn'} onClick={toggle}>{following ? 'Following' : 'Follow'}</button>;
}
