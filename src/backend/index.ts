import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authMiddleware } from './middleware/auth.js';
import { db, supabase } from './db/index.js';
import { venues, checkIns, users } from './db/schema.js';
import { eq, sql, desc } from 'drizzle-orm';
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

// app.use('*', logger());
// app.use('*', cors()); // Removed to prevent Vercel Node runtime crash. Same-origin requests don't need this.

app.get('/', (c) => c.text('VibeMap API v1'));

// --- Authentication ---
app.post('/api/auth/google', async (c) => {
  try {
    const { email, username, avatarUrl, walletAddress } = await c.req.json();
    console.log('[Backend] Received Google Auth:', { email, username });

    // Upsert user based on email
    const newUser = await db.insert(users).values({
      email,
      walletAddress,
      username,
      avatarUrl,
    }).onConflictDoUpdate({
      target: users.email,
      set: { walletAddress, avatarUrl, username }
    }).returning();

    console.log('[Backend] User upserted:', newUser[0]?.id);
    return c.json({ user: newUser[0] });
  } catch (error) {
    console.error('[Backend] Auth Error:', error);
    return c.json({ error: 'Failed to sync user', details: String(error) }, 500);
  }
});

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
  try {
    const { lat, lng, radius = 5000 } = c.req.query();
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    console.log(`[Backend] Searching venues near: ${latitude}, ${longitude}`);

    const nearbyVenues = await db.select().from(venues).where(
      sql`ABS(latitude - ${latitude}) < 0.1 AND ABS(longitude - ${longitude}) < 0.1`
    );

    return c.json(nearbyVenues);
  } catch (error) {
    console.error('[Backend] Fetch Venues Error:', error);
    return c.json({ error: 'Failed to fetch venues' }, 500);
  }
});

app.post('/api/venues', authMiddleware, async (c) => {
  try {
    const { name, category, latitude, longitude, address } = await c.req.json();
    
    const newVenue = await db.insert(venues).values({
      name,
      category,
      latitude,
      longitude,
      address,
      totalCheckIns: 0,
      verified: false,
    }).returning();

    return c.json(newVenue[0]);
  } catch (error) {
    console.error('[Backend] Create Venue Error:', error);
    return c.json({ error: 'Failed to create venue' }, 500);
  }
});

// --- Check-ins ---
app.post('/api/check-ins/sponsor', authMiddleware, async (c) => {
  const user = c.get('user') as Variables['user'];
  const { venueId, imageUrl, caption, rating, latitude, longitude } = await c.req.json();

  const venue = await db.query.venues.findFirst({
    where: eq(venues.id, venueId)
  });

  if (!venue) {
    return c.json({ error: 'Venue not found' }, 400);
  }

  // If venue is not registered on-chain yet, provide a dev-friendly mock response
  if (!venue.onChainId) {
    try {
      const mockStampId = `mock-${Date.now()}`;
      const inserted = await db.insert(checkIns).values({
        userId: user.id,
        venueId: venue.id,
        latitude: latitude || venue.latitude,
        longitude: longitude || venue.longitude,
        photoUrl: imageUrl,
        caption,
        rating,
        stampNftId: mockStampId,
        visitorNumber: (venue.totalCheckIns || 0) + 1
      }).returning();

      // update venue stats
      await db.update(venues).set({ totalCheckIns: (venue.totalCheckIns || 0) + 1 }).where(eq(venues.id, venue.id));

      return c.json({ mock: true, checkIn: inserted[0], stampNftId: mockStampId });
    } catch (e) {
      console.error('[Backend] Mock check-in failed:', e);
      return c.json({ error: 'Failed to save check-in (mock)' }, 500);
    }
  }

  // Venue is registered on-chain -> perform server-side mint and persist result
  try {
    const exec = await sui.executeCheckIn({
      venueOnChainId: venue.onChainId,
      imageUrl,
      caption,
      rating,
      userAddress: user.walletAddress
    });

    const visitorNumber = exec?.stamped?.visitorNumber ? parseInt(exec.stamped.visitorNumber, 10) : (venue.totalCheckIns || 0) + 1;
    const stampNftId = exec?.stamped?.stampId || `onchain-${Date.now()}`;

    const inserted = await db.insert(checkIns).values({
      userId: user.id,
      venueId: venue.id,
      latitude: latitude || venue.latitude,
      longitude: longitude || venue.longitude,
      photoUrl: imageUrl,
      caption,
      rating,
      stampNftId: stampNftId?.toString?.() || null,
      visitorNumber: visitorNumber
    }).returning();

    await db.update(venues).set({ totalCheckIns: (venue.totalCheckIns || 0) + 1 }).where(eq(venues.id, venue.id));

    return c.json({ onChain: true, tx: exec.result, stamped: exec.stamped, checkIn: inserted[0] });
  } catch (err) {
    console.error('[Backend] executeCheckIn failed:', err);
    return c.json({ error: 'On-chain mint failed' }, 500);
  }
});

// --- Upload image (Supabase Storage) ---
app.post('/api/upload', authMiddleware, async (c) => {
  try {
    const user = c.get('user') as Variables['user'];
    const { imageBase64, filename } = await c.req.json();
    if (!imageBase64) return c.json({ error: 'No image provided' }, 400);

    const matches = imageBase64.match(/^data:(image\/[^;]+);base64,(.+)$/);
    if (!matches) return c.json({ error: 'Invalid data URL' }, 400);

    const contentType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const ext = contentType.split('/')[1] || 'jpg';
    const key = `stamps/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;

    try {
      const upload = await supabase.storage.from('stamps').upload(key, buffer, { contentType, upsert: true });
      if (upload.error) throw upload.error;
      const { data } = supabase.storage.from('stamps').getPublicUrl(key);
      return c.json({ url: data.publicUrl });
    } catch (e) {
      console.warn('[Upload] Supabase storage upload failed, returning inline data URL', e);
      return c.json({ url: imageBase64 });
    }
  } catch (e) {
    console.error('[Upload] Error:', e);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

// --- Feed (recent check-ins) ---
app.get('/api/feed', authMiddleware, async (c) => {
  try {
    const rows = await db.select().from(checkIns).orderBy(desc(checkIns.createdAt)).limit(25);
    // Join with users for username/avatar
    const feed = await Promise.all(rows.map(async (r: any) => {
      const u = await db.query.users.findFirst({ where: eq(users.id, r.userId) });
      const v = await db.query.venues.findFirst({ where: eq(venues.id, r.venueId) });
      return { id: r.id, user: { username: u?.username || 'user', avatarUrl: u?.avatarUrl }, venue: { name: v?.name }, ...r };
    }));
    return c.json(feed);
  } catch (e) {
    console.error('[Backend] Fetch feed error', e);
    return c.json({ error: 'Failed to fetch feed' }, 500);
  }
});

// --- Leaderboard ---
app.get('/api/leaderboard', async (c) => {
  try {
    // Simple leaderboard based on totalStamps field in users
    const top = await db.select().from(users).orderBy(desc(users.totalStamps)).limit(10);
    return c.json(top.map((u: any) => ({ username: u.username, walletAddress: u.walletAddress, totalStamps: u.totalStamps })));
  } catch (e) {
    console.error('[Backend] Leaderboard error', e);
    return c.json({ error: 'Failed to fetch leaderboard' }, 500);
  }
});

// --- Venues Trending ---
app.get('/api/venues/trending', async (c) => {
  try {
    const top = await db.select().from(venues).orderBy(desc(venues.totalCheckIns)).limit(10);
    return c.json(top);
  } catch (e) {
    console.error('[Backend] Trending venues error', e);
    return c.json({ error: 'Failed to fetch trending venues' }, 500);
  }
});

// --- Notifications (mock) ---
app.get('/api/notifications', authMiddleware, async (c) => {
  return c.json([
    { id: 1, type: 'reply', text: '@budi replied to your comment', time: '5m' },
    { id: 2, type: 'like', text: '@alice liked your stamp', time: '1h' },
    { id: 3, type: 'achievement', text: 'Achievement unlocked: Coffee Explorer', time: '2h' }
  ]);
});

// --- Vibe Drop ---
app.post('/api/vibe/drop', authMiddleware, async (c) => {
  const user = c.get('user') as Variables['user'];
  const { latitude, longitude, caption, imageUrl } = await c.req.json();

  // In a real app, you would verify the location distance between user and claimed venue
  // or just allow dropping "Vibe" anywhere. 
  // Let's implement the coordinate-based dropping.

  // Multiplier for Move U64 (lat/lng * 1000000)
  const latU64 = BigInt(Math.floor(latitude * 1000000));
  const lngU64 = BigInt(Math.floor(longitude * 1000000));

  // Placeholder venue ID for coordinate drops (or use a special "Global" venue)
  const GLOBAL_VENUE_ID = "0xd43562d2f88f312db3fe1d8428eb46cdd24178926fa0d46e8d032346348b59fc"; // AdminCap/Venue placeholder

  return c.json({ message: "Vibe drop logic initiated", latU64: latU64.toString() });
});

export default {
  port: 3000,
  fetch: app.fetch,
};
