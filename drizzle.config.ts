import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

export default {
  schema: './src/app/marshal-qr-code/db/schema.ts',
  out: './src/app/marshal-qr-code/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    connectionString: process.env.NEON_DATABASE_URL || '',
  },
} satisfies Config; 