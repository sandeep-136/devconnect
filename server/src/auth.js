// JWT auth middleware. The client sends:  Authorization: Bearer <token>
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const SECRET = process.env.JWT_SECRET || 'dev-secret';

export const signToken = (user) => jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' });

// Blocks the request with 401 unless a valid token is present. Sets req.userId.
export function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    req.userId = jwt.verify(token, SECRET).id;
    next();
  } catch {
    res.status(401).json({ error: 'Please log in' });
  }
}

// Same, but anonymous visitors are allowed (req.userId stays undefined).
export function optionalAuth(req, _res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try { req.userId = jwt.verify(token, SECRET).id; } catch { /* anonymous */ }
  next();
}
