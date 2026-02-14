import axios from 'axios';
import { db } from '../src/backend/db/index.js';
import { venues } from '../src/backend/db/schema.js';
import { sql } from 'drizzle-orm';

const OVERPASS_URL = 'https://maps.mail.ru/osm/tools/overpass/api/interpreter';

// Query for Makassar, Indonesia (smaller area first)
const QUERY = `
  [out:json];
  node["amenity"="cafe"](-5.16,119.40,-5.12,119.45);
  out body;
`;

async function seed() {
  console.log('Fetching venues from OpenStreetMap...');
  try {
    const response = await axios.post(OVERPASS_URL, QUERY);
    const elements = response.data.elements;

    console.log(`Found ${elements.length} venues. Inserting into database...`);

    let count = 0;
    for (const el of elements) {
      if (!el.tags || !el.tags.name) continue;

      try {
        await db.insert(venues).values({
          name: el.tags.name,
          category: el.tags.amenity || el.tags.tourism || el.tags.leisure || 'other',
          latitude: el.lat,
          longitude: el.lon,
          address: el.tags['addr:street'] || null,
          totalCheckIns: 0,
          verified: false
        }).onConflictDoNothing(); // Skip duplicates
        count++;
      } catch (e) {
        console.error(`Failed to insert ${el.tags.name}:`, e);
      }
    }

    console.log(`Successfully inserted ${count} venues.`);
    process.exit(0);
  } catch (error) {
    console.error('Error fetching/seeding venues:', error);
    process.exit(1);
  }
}

seed();
