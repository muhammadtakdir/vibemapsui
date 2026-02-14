import { Context, Next } from 'hono';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const authMiddleware = async (c: Context, next: Next) => {
  let authHeader = '';
  try {
    authHeader = c.req.header('Authorization') || '';
  } catch (e) {
    console.error('[AuthMiddleware] Error reading header:', e);
  }
  
  if (!authHeader) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');
  
  // For MVP, look up user by email or telegramId (if using sub as email)
  const user = await db.query.users.findFirst({
    where: (users, { eq, or }) => or(
        eq(users.telegramId, token),
        eq(users.email, token)
    )
  });

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  c.set('user', user);
  await next();
};
