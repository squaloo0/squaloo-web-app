import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables from .env.local at the project root
dotenv.config({ path: join(__dirname, '../../../../.env.local') });

console.log('Environment variables:');
console.log('NEON_DATABASE_URL:', process.env.NEON_DATABASE_URL ? 'Defined (value hidden for security)' : 'Not defined');

// Check the actual path being used
console.log('Path to .env.local:', join(__dirname, '../../../../.env.local')); 