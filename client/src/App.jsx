import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Navbar from './components/Navbar.jsx';
import Suggested from './components/Suggested.jsx';
import Feed from './pages/Feed.jsx';
import Login from './pages/Login.jsx';
import Developers from './pages/Developers.jsx';
import Profile from './pages/Profile.jsx';
import EditProfile from './pages/EditProfile.jsx';

// Pages that need a logged-in user are wrapped in this guard.
function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <div className="shell">
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/developers" element={<Developers />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/edit-profile" element={<Protected><EditProfile /></Protected>} />
        </Routes>
        <footer className="footer">A project by Sandeep Sagar - Developed with AI assistance</footer>
      </main>
      <aside className="rail"><Suggested /><p className="rail-note">React + Express + SQLite. JWT auth.</p></aside>
    </div>
  );
}
