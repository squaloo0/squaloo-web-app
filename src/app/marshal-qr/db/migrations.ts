import { migrate } from 'drizzle-orm/neon-http/migrator';
import { db } from './client';
import { join } from 'path';

// Run migrations
async function runMigrations() {
  console.log('Running migrations...');
  
  try {
    // Use an absolute path to the migrations folder
    const migrationsFolder = join(__dirname, 'migrations');
    await migrate(db, { migrationsFolder });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

// Run the migration function
runMigrations();
