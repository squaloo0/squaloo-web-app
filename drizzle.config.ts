import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Parse the connection string
function parseConnectionString(connectionString: string) {
  try {
    // Example connection string format:
    // postgresql://username:password@hostname:port/database?sslmode=require
    const url = new URL(connectionString);
    
    return {
      host: url.hostname,
      port: url.port ? parseInt(url.port) : 5432,
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1), // Remove leading slash
      ssl: url.searchParams.get('sslmode') === 'require' ? true : false
    };
  } catch (error) {
    console.error('Error parsing connection string:', error);
    return {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: '',
      database: 'postgres',
      ssl: false
    };
  }
}

const connectionString = process.env.NEON_DATABASE_URL || '';
const dbCredentials = parseConnectionString(connectionString);

export default {
  schema: './src/app/marshal-qr-code/db/schema.ts',
  out: './src/app/marshal-qr-code/db/migrations',
  dialect: 'postgresql',
  dbCredentials,
} satisfies Config; 