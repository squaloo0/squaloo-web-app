import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Create a function to initialize the database connection
export function createDbConnection() {
  if (!process.env.NEON_DATABASE_URL) {
    console.error('NEON_DATABASE_URL is not defined in environment variables. Database operations will fail.');
    throw new Error('NEON_DATABASE_URL is not defined');
  }

  // Initialize the Neon client with your connection string
  const sql = neon(process.env.NEON_DATABASE_URL);

  // Initialize Drizzle with the Neon client and schema
  return drizzle(sql, { schema });
}

// Export a lazy-loaded database connection
export const db = createDbConnection();
