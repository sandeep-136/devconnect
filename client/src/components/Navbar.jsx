// Left sidebar: logo, links, and the logged-in user's mini card.
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import Avatar from './Avatar.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <aside className="sidebar">
      <Link to="/" className="logo"><b>dev</b>/connect<i>_</i></Link>
      <nav>
        <NavLink to="/" end><em>01</em> Feed</NavLink>
        <NavLink to="/developers"><em>02</em> Developers</NavLink>
        {user && <NavLink to={`/profile/${user.id}`}><em>03</em> My profile</NavLink>}
        {user && <NavLink to="/edit-profile"><em>04</em> Edit profile</NavLink>}
      </nav>
      <div className="side-bottom">
        {user ? (
          <>
            <div className="me"><Avatar name={user.name} size={34} /><div><strong>{user.name}</strong><span>{user.headline || 'add a headline'}</span></div></div>
            <button className="btn ghost sm" onClick={() => { logout(); nav('/'); }}>Log out</button>
          </>
        ) : <Link className="btn" to="/login">Log in / Sign up</Link>}
      </div>
    </aside>
  );
}
