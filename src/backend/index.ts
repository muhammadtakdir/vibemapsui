import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authMiddleware } from './middleware/auth.js';
import { db } from './db/index.js';
import { venues, checkIns, users } from './db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { sui } from './lib/sui.js';

type Variables = {
  user: {
    id: string;
    telegramId: string;
    walletAddress: string;
    username: string | null;
  }
}

export const app = new Hono<{ Variables: Variables }>();

app.use('*', logger());
app.use('*', cors());

app.get('/', (c) => c.text('VibeMap API v1'));

// --- Authentication ---
// Placeholder for Telegram InitData verification
app.post('/api/auth/telegram', async (c) => {
  const { initData, walletAddress } = await c.req.json();
  // TODO: Verify initData with Telegram Bot Token
  
  // Upsert user
  const newUser = await db.insert(users).values({
    telegramId: 'placeholder', // Extract from initData
    walletAddress,
    username: 'placeholder',
  }).onConflictDoUpdate({
    target: users.telegramId,
    set: { walletAddress }
  }).returning();

  return c.json({ user: newUser[0] });
});

// --- Venues ---
app.get('/api/venues/nearby', async (c) => {
  const { lat, lng, radius = 5000 } = c.req.query();
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  // Simple bounding box query (can be replaced with PostGIS if available)
  const nearbyVenues = await db.select().from(venues).where(
    sql`ABS(latitude - ${latitude}) < 0.1 AND ABS(longitude - ${longitude}) < 0.1`
  );

  return c.json(nearbyVenues);
});

// --- Check-ins ---
app.post('/api/check-ins/sponsor', authMiddleware, async (c) => {
  const user = c.get('user') as Variables['user'];
  const { venueId, imageUrl, caption, rating } = await c.req.json();

  const venue = await db.query.venues.findFirst({
    where: eq(venues.id, venueId)
  });

  if (!venue || !venue.onChainId) {
    return c.json({ error: 'Venue not found or not registered on-chain' }, 400);
  }

  const { txBytes, sponsorSignature } = await sui.createSponsoredCheckIn({
    venueOnChainId: venue.onChainId,
    imageUrl,
    caption,
    rating,
    userAddress: user.walletAddress
  });

  return c.json({
    txBytes,
    sponsorSignature
  });
});

export default {
  port: 3000,
  fetch: app.fetch,
};
