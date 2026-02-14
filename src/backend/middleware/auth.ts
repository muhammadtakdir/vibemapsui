import { Context, Next } from 'hono';
import { db, supabase } from '../db/index.js';
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

  // Try DB lookup first; if Postgres/Drizzle is unreachable, fall back to Supabase HTTP client
  try {
    const user = await db.query.users.findFirst({
      where: (users, { eq, or }) => or(
        eq(users.telegramId, token),
        eq(users.email, token)
      )
    });

    if (user) {
      c.set('user', user);
      await next();
      return;
    }
  } catch (dbErr: any) {
    console.warn('[AuthMiddleware] DB lookup failed, falling back to Supabase client:', dbErr?.message || dbErr);
    // continue to try Supabase below
  }

  // Fallback: try Supabase service-role query (HTTP)
  try {
    const { data, error } = await supabase.from('users').select('*').or(`telegram_id.eq.${token},email.eq.${token}`).limit(1).single();
    if (error) {
      console.warn('[AuthMiddleware] Supabase fallback returned error:', error.message);
    }
    if (data) {
      // Keep shape similar to DB user row
      const user = {
        id: data.id,
        telegramId: data.telegram_id ?? data.telegramId,
        walletAddress: data.wallet_address ?? data.walletAddress,
        username: data.username,
        avatarUrl: data.avatar_url ?? data.avatarUrl,
        totalStamps: data.total_stamps ?? data.totalStamps
      };
      c.set('user', user as any);
      await next();
      return;
    }
  } catch (supErr: any) {
    console.error('[AuthMiddleware] Supabase fallback failed:', supErr?.message || supErr);
  }

  return c.json({ error: 'User not found' }, 401);
};
