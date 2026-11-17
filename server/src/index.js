import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import db from './db.js';
import { seed } from './seed.js';

// Auto-seed demo data the first time the database is empty.
if (db.prepare('SELECT COUNT(*) c FROM users').get().c === 0) seed();

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`DevConnect API running on http://localhost:${port}`));
