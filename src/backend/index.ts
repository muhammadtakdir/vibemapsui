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
  const { venueId, imageUrl, caption, rating, latitude, longitude } = await c.req.json();

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
    latitude: latitude || venue.latitude,
    longitude: longitude || venue.longitude,
    userAddress: user.walletAddress
  });

  return c.json({
    txBytes,
    sponsorSignature
  });
});

// --- Vibe Drop ---
app.post('/api/vibe/drop', authMiddleware, async (c) => {
  const user = c.get('user') as Variables['user'];
  const { latitude, longitude, caption, imageUrl } = await c.req.json();

  // In a real app, you would verify the location distance between user and claimed venue
  // or just allow dropping "Vibe" anywhere. 
  // Let's implement the coordinate-based dropping.

  // Multiplier for Move U64 (lat/lng * 1,000,000)
  const latU64 = BigInt(Math.floor(latitude * 1000000));
  const lngU64 = BigInt(Math.floor(longitude * 1000000));

  // Placeholder venue ID for coordinate drops (or use a special "Global" venue)
  const GLOBAL_VENUE_ID = "0xd43562d2f88f312db3fe1d8428eb46cdd24178926fa0d46e8d032346348b59fc"; // AdminCap/Venue placeholder

  // Logic to call Move mint_internal or venue_registry::check_in
  // For simplicity, we use the check_in function but with dynamic coordinates
  // (We would need to update Sui library to support this)

  return c.json({ message: "Vibe drop logic initiated", latU64: latU64.toString() });
});

export default {
  port: 3000,
  fetch: app.fetch,
};
