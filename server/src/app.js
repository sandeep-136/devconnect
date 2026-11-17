// Express app: all REST routes live here. (index.js just starts the server.)
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import db from './db.js';
import { signToken, requireAuth, optionalAuth } from './auth.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json());

// Never send password_hash to the browser.
const publicUser = (u) => ({
  id: u.id, name: u.name, email: u.email, headline: u.headline, bio: u.bio,
  skills: u.skills ? u.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
  github: u.github, website: u.website, created_at: u.created_at,
});

// ---------- AUTH ----------
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase()))
    return res.status(409).json({ error: 'Email already registered' });
  const hash = bcrypt.hashSync(password, 10); // salted hash, never store plain passwords
  const info = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(name.trim(), email.toLowerCase(), hash);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get((email || '').toLowerCase());
  // Same message for both failures so attackers can't tell which emails exist.
  if (!user || !bcrypt.compareSync(password || '', user.password_hash))
    return res.status(401).json({ error: 'Invalid email or password' });
  res.json({ token: signToken(user), user: publicUser(user) });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(401).json({ error: 'User not found' });
  res.json(publicUser(user));
});

// ---------- PROFILES ----------
app.get('/api/users', optionalAuth, (req, res) => {
  const q = `%${(req.query.q || '').trim()}%`;
  const rows = db.prepare(`SELECT * FROM users WHERE name LIKE ? OR skills LIKE ? OR headline LIKE ? ORDER BY created_at DESC LIMIT 50`).all(q, q, q);
  const followingSet = new Set(
    req.userId ? db.prepare('SELECT following_id FROM follows WHERE follower_id = ?').all(req.userId).map((r) => r.following_id) : []);
  res.json(rows.map((u) => ({ ...publicUser(u), email: undefined, is_following: followingSet.has(u.id) })));
});

app.get('/api/users/:id', optionalAuth, (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!u) return res.status(404).json({ error: 'User not found' });
  const followers = db.prepare('SELECT COUNT(*) c FROM follows WHERE following_id = ?').get(u.id).c;
  const following = db.prepare('SELECT COUNT(*) c FROM follows WHERE follower_id = ?').get(u.id).c;
  const is_following = !!(req.userId && db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?').get(req.userId, u.id));
  const posts = db.prepare('SELECT id, content, created_at FROM posts WHERE user_id = ? ORDER BY id DESC').all(u.id);
  res.json({ ...publicUser(u), email: undefined, followers, following, is_following, posts });
});

app.put('/api/users/me', requireAuth, (req, res) => {
  const { name, headline = '', bio = '', skills = [], github = '', website = '' } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
  const skillStr = (Array.isArray(skills) ? skills : String(skills).split(',')).map((s) => s.trim()).filter(Boolean).join(',');
  db.prepare('UPDATE users SET name=?, headline=?, bio=?, skills=?, github=?, website=? WHERE id=?')
    .run(name.trim(), headline, bio, skillStr, github, website, req.userId);
  res.json(publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId)));
});

// ---------- POSTS ----------
// scope=following returns only posts from people you follow (plus yourself).
app.get('/api/posts', optionalAuth, (req, res) => {
  let sql = `SELECT p.id, p.content, p.created_at, u.id AS author_id, u.name AS author_name, u.headline AS author_headline
             FROM posts p JOIN users u ON u.id = p.user_id`;
  const params = [];
  if (req.query.scope === 'following' && req.userId) {
    sql += ` WHERE p.user_id = ? OR p.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?)`;
    params.push(req.userId, req.userId);
  }
  sql += ' ORDER BY p.id DESC LIMIT 100';
  res.json(db.prepare(sql).all(...params));
});

app.post('/api/posts', requireAuth, (req, res) => {
  const content = (req.body?.content || '').trim();
  if (!content) return res.status(400).json({ error: 'Post cannot be empty' });
  if (content.length > 500) return res.status(400).json({ error: 'Max 500 characters' });
  const info = db.prepare('INSERT INTO posts (user_id, content) VALUES (?, ?)').run(req.userId, content);
  res.status(201).json(db.prepare(`SELECT p.id, p.content, p.created_at, u.id AS author_id, u.name AS author_name, u.headline AS author_headline
    FROM posts p JOIN users u ON u.id = p.user_id WHERE p.id = ?`).get(info.lastInsertRowid));
});

app.delete('/api/posts/:id', requireAuth, (req, res) => {
  // user_id check = authorization: you can only delete your own posts.
  const r = db.prepare('DELETE FROM posts WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  if (!r.changes) return res.status(404).json({ error: 'Post not found (or not yours)' });
  res.json({ ok: true });
});

// ---------- FOLLOW / CONNECT ----------
app.post('/api/users/:id/follow', requireAuth, (req, res) => {
  const target = Number(req.params.id);
  if (target === req.userId) return res.status(400).json({ error: "You can't follow yourself" });
  if (!db.prepare('SELECT id FROM users WHERE id = ?').get(target)) return res.status(404).json({ error: 'User not found' });
  db.prepare('INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)').run(req.userId, target);
  res.json({ following: true });
});

app.delete('/api/users/:id/follow', requireAuth, (req, res) => {
  db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(req.userId, Number(req.params.id));
  res.json({ following: false });
});

// Public counters for the landing page.
app.get('/api/stats', (_req, res) => {
  const count = (t) => db.prepare(`SELECT COUNT(*) c FROM ${t}`).get().c;
  res.json({ developers: count('users'), posts: count('posts'), connections: count('follows') });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));
// Production/preview: if the client has been built, serve it from this same server.
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html'))); // React Router fallback
}

export default app;
