import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Access token (JWT): 15 minute
export const signAccessToken = (user) =>
  jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
    subject: String(user.id),
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    algorithm: 'HS256',
  });

export const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

// Refresh token: random string (JWT nathi)
export const generateRefreshToken = () => crypto.randomBytes(48).toString('hex');

// Database ma fakt hash store thase
export const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');