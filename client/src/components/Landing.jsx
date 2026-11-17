// Landing hero shown to logged-out visitors: headline, live stats from the API, a fake terminal, feature tiles.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

// Counts up from 0 to `to` in ~900ms (requestAnimationFrame animation).
function Counter({ to }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf; const t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / 900);
      setN(Math.round(to * (1 - Math.pow(1 - k, 3)))); // ease-out
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{n}</>;
}

const STACK = ['React', 'Vite', 'Express', 'SQLite', 'JWT', 'bcrypt', 'REST', 'Node.js'];

export default function Landing() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api('/stats').then(setStats).catch(() => {}); }, []);
  return (
    <>
      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-text">
          <span className="pill"><i /> live · open to all developers</span>
          <h1>Ship it.<br />Share it.<br /><mark>Connect.</mark></h1>
          <p>The network for developers who build in public. Post what you are working on, follow people worth learning from, and find your next collaborator.</p>
          <div className="hero-cta">
            <Link className="btn big" to="/login">Join DevConnect →</Link>
            <Link className="btn ghost big" to="/developers">Browse developers</Link>
          </div>
        </div>
        <div className="term">
          <div className="term-bar"><span /><span /><span /><em>~/devconnect</em></div>
          <pre>{`$ curl -X POST /api/auth/login
{ "email": "you@dev.io" }

`}<b>200 OK</b>{`
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "name": "You", "skills": ["React","Node"] }
}

$ curl /api/posts?scope=following
`}<b>200 OK</b>{` · 12 posts`}<span className="caret" /></pre>
        </div>
      </section>

      {stats && (
        <section className="stats-strip">
          <div><strong><Counter to={stats.developers} /></strong><span>developers</span></div>
          <div><strong><Counter to={stats.posts} /></strong><span>posts shared</span></div>
          <div><strong><Counter to={stats.connections} /></strong><span>connections</span></div>
        </section>
      )}

      <div className="marquee"><div>{[...STACK, ...STACK, ...STACK].map((t, i) => <span key={i}>{t}</span>)}</div></div>

      <section className="tiles">
        <div><em>01</em><h3>Secure by default</h3><p>bcrypt-hashed passwords and JWT sessions.</p></div>
        <div><em>02</em><h3>A feed that follows you</h3><p>Switch between everyone and just the people you follow.</p></div>
        <div><em>03</em><h3>Real profiles</h3><p>Skills, links and bio. Search developers by what they know.</p></div>
      </section>
    </>
  );
}
