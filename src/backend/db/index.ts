import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
// Log connection (masked password) to debug ENOTFOUND
console.log('[Database] Attempting connection to:', connectionString.replace(/:([^:@]+)@/, ':***@'));

const client = postgres(connectionString, { 
  prepare: false,
  ssl: { rejectUnauthorized: false }
});
export const db = drizzle(client, { schema });

// Supabase Client for Auth and Storage
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
