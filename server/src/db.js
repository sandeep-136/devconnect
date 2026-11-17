// Database layer: SQLite via better-sqlite3 (synchronous, zero config).
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
dotenv.config();

const db = new Database(process.env.DB_FILE || 'devconnect.db');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON'); // enforce relations (cascade deletes etc.)

// Three tables: users, posts, follows (a many-to-many "self relation" on users).
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  headline TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  skills TEXT DEFAULT '',          -- comma separated, e.g. "React,Node.js"
  github TEXT DEFAULT '',
  website TEXT DEFAULT '',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS follows (
  follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id)   -- can't follow the same person twice
);
`);
export default db;
