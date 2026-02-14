import { Context, Next } from 'hono';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');
  
  // In a real app, verify JWT here
  // For MVP, we'll assume the token is the Telegram ID for simplicity or look up the user
  const user = await db.query.users.findFirst({
    where: eq(users.telegramId, token)
  });

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  c.set('user', user);
  await next();
};
