import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/config.ts';

export async function authMiddleware(c: Context, next: Next) {
  const auth = c.req.header('Authorization')?.split(' ');
  if (auth?.[0] !== 'Bearer' || !auth[1]) return c.text('Unauthorized', 401);
  try {
    jwt.verify(auth[1], JWT_SECRET);
    await next();
  } catch {
    return c.text('Unauthorized', 401);
  }
}
