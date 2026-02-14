import { db } from '../src/backend/db/index.js';
import { users, venues, checkIns, comments, sponsoredTransactions } from '../src/backend/db/schema.js';
import { eq } from 'drizzle-orm';

function randHex(len = 40) {
  return '0x' + Array.from({ length: len }).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

async function seed() {
  console.log('[seed-sample-data] Starting');

  const existingVenues = await db.select().from(venues).limit(50);
  if (!existingVenues || existingVenues.length === 0) {
    console.error('[seed-sample-data] No venues found. Run scripts/seed-venues.ts first.');
    process.exit(1);
  }

  // --- Users ---
  const sampleUsers = [
    { walletAddress: randHex(), username: 'alice', avatarUrl: 'https://i.pravatar.cc/150?img=1', totalStamps: 3 },
    { walletAddress: randHex(), username: 'budi', avatarUrl: 'https://i.pravatar.cc/150?img=2', totalStamps: 2 },
    { walletAddress: randHex(), username: 'citra', avatarUrl: 'https://i.pravatar.cc/150?img=3', totalStamps: 1 }
  ];

  const insertedUsers = [] as any[];
  for (const u of sampleUsers) {
    try {
      const res = await db.insert(users).values({
        walletAddress: u.walletAddress,
        username: u.username,
        avatarUrl: u.avatarUrl,
        totalStamps: u.totalStamps
      }).onConflictDoNothing({ target: users.walletAddress }).returning();

      if (res && res[0]) insertedUsers.push(res[0]);
    } catch (e) {
      console.warn('[seed-sample-data] user insert failed (continue):', e?.message || e);
    }
  }

  // If onConflictDoNothing returned empty (already present), fetch them
  if (insertedUsers.length === 0) {
    const all = await db.select().from(users).limit(10);
    for (const s of sampleUsers) {
      const found = all.find((x: any) => x.walletAddress === s.walletAddress);
      if (found) insertedUsers.push(found);
    }
  }

  console.log(`[seed-sample-data] Users ensured: ${insertedUsers.length}`);

  // --- Check-ins ---
  const toCreateCheckIns: Array<any> = [];
  const pickVenues = existingVenues.slice(0, 8);

  let ciCount = 0;
  for (let i = 0; i < 8; i++) {
    const user = insertedUsers[i % insertedUsers.length];
    const venue = pickVenues[i % pickVenues.length];
    const photo = `https://picsum.photos/seed/vibe-${i}/600/400`;
    const caption = ['Great coffee!', 'Lovely vibes', 'Must visit', 'Hidden gem'][i % 4];
    const rating = 3 + (i % 3);

    try {
      const inserted = await db.insert(checkIns).values({
        userId: user.id,
        venueId: venue.id,
        latitude: venue.latitude,
        longitude: venue.longitude,
        photoUrl: photo,
        caption,
        rating,
        stampNftId: `mock-seed-${Date.now()}-${i}`,
        visitorNumber: (venue.totalCheckIns || 0) + 1
      }).returning();

      // update venue totalCheckIns
      await db.update(venues).set({ totalCheckIns: (venue.totalCheckIns || 0) + 1 }).where(eq(venues.id, venue.id));

      // increment user.totalStamps
      await db.update(users).set({ totalStamps: (user.totalStamps || 0) + 1 }).where(eq(users.id, user.id));

      toCreateCheckIns.push(inserted[0]);
      ciCount++;
    } catch (e) {
      console.warn('[seed-sample-data] check-in insert failed (continue):', e?.message || e);
    }
  }

  console.log(`[seed-sample-data] Inserted ${ciCount} check-ins`);

  // --- Comments ---
  let commentsCount = 0;
  for (let i = 0; i < Math.min(5, toCreateCheckIns.length); i++) {
    const ci = toCreateCheckIns[i];
    const commenter = insertedUsers[(i + 1) % insertedUsers.length];
    try {
      await db.insert(comments).values({
        checkInId: ci.id,
        userId: commenter.id,
        content: ['Love this place!', 'Nice shot', 'Adding to my list'][i % 3],
        replyDepth: 0
      });
      commentsCount++;
    } catch (e) {
      console.warn('[seed-sample-data] comment insert failed (continue):', e?.message || e);
    }
  }

  // --- Sponsored transactions (mock) ---
  let txCount = 0;
  for (let i = 0; i < insertedUsers.length; i++) {
    const u = insertedUsers[i];
    try {
      await db.insert(sponsoredTransactions).values({
        userId: u.id,
        transactionDigest: `0xmockdigest${Date.now()}${i}`,
        transactionType: 'mint_stamp',
        gasUsed: '0',
        status: 'success'
      });
      txCount++;
    } catch (e) {
      console.warn('[seed-sample-data] sponsored tx insert failed (continue):', e?.message || e);
    }
  }

  console.log(`[seed-sample-data] Inserted ${commentsCount} comments and ${txCount} sponsored txs`);

  // Summary counts (lightweight)
  const venueCount = (await db.select().from(venues).limit(1)).length;
  const userCount = (await db.select().from(users).limit(1)).length;
  const checkInsCount = (await db.select().from(checkIns).limit(5)).length;

  console.log('[seed-sample-data] Done — sample data created. Quick sanity:');
  console.log(`  venues (sample check): ${existingVenues.length}`);
  console.log(`  users (sample check): ${userCount}`);
  console.log(`  check-ins (sample check): ${checkInsCount}`);

  process.exit(0);
}

seed().catch((e) => {
  console.error('[seed-sample-data] Fatal error:', e);
  process.exit(1);
});