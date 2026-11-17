// Demo data so the app looks alive. Run: npm run seed   (demo password for all: password123)
import bcrypt from 'bcryptjs';
import db from './db.js';

const users = [
  ['Aarav Mehta', 'aarav@demo.dev', 'Full-stack developer', 'Building small tools with React and Node. Coffee, code, repeat.', 'React,Node.js,Express,SQL', 'https://github.com/aarav-demo'],
  ['Priya Nair', 'priya@demo.dev', 'Frontend engineer', 'Loves clean UI, accessibility and design systems.', 'React,CSS,TypeScript,Figma', 'https://github.com/priya-demo'],
  ['Rohan Gupta', 'rohan@demo.dev', 'Backend developer', 'APIs, databases and making things fast.', 'Node.js,PostgreSQL,Docker,REST', 'https://github.com/rohan-demo'],
  ['Sneha Kulkarni', 'sneha@demo.dev', 'ML enthusiast', 'Student exploring machine learning and web together.', 'Python,scikit-learn,React', 'https://github.com/sneha-demo'],
];
const posts = [
  [1, 'Just shipped my first Express + SQLite API. JWT auth finally clicked for me today.'],
  [2, 'Tip: use semantic HTML before reaching for ARIA. A <button> beats a clickable <div> every time.'],
  [3, 'Indexes are free speed. Added one on a foreign key and a query went from 800ms to 6ms.'],
  [4, 'Looking for a study buddy for React hooks - useEffect dependency arrays still trick me!'],
  [1, 'Reminder: never store plain-text passwords. bcrypt + salt, always.'],
  [2, 'Dark mode done right means checking your contrast ratios, not just inverting colors.'],
];

export function seed() {
  const hash = bcrypt.hashSync('password123', 10);
  const addUser = db.prepare('INSERT INTO users (name,email,password_hash,headline,bio,skills,github) VALUES (?,?,?,?,?,?,?)');
  const addPost = db.prepare('INSERT INTO posts (user_id, content) VALUES (?, ?)');
  const addFollow = db.prepare('INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)');
  db.transaction(() => {
    users.forEach(([n, e, h, b, s, g]) => addUser.run(n, e, hash, h, b, s, g));
    posts.forEach(([u, c]) => addPost.run(u, c));
    [[1, 2], [1, 3], [2, 1], [3, 1], [4, 1], [4, 2]].forEach(([a, b]) => addFollow.run(a, b));
  })();
  console.log('Seeded demo data (password for all demo users: password123)');
}

// Allow `npm run seed`
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  if (db.prepare('SELECT COUNT(*) c FROM users').get().c === 0) seed();
  else console.log('Database already has users; delete devconnect.db to reseed.');
}
