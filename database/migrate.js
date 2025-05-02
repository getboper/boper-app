/**
 * Boper Database Migration Script
 * 
 * This script will create all necessary tables for the Boper application.
 * It uses the database connection specified in your .env file.
 */

require('dotenv').config();
const { Pool } = require('pg');
const { migrate } = require('drizzle-orm/postgres-js/migrator');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

// Connection configuration from environment variables
const connectionString = process.env.DATABASE_URL;

async function runMigration() {
  if (!connectionString) {
    console.error('Error: DATABASE_URL environment variable is not set.');
    console.error('Please create a .env file with your database connection string.');
    process.exit(1);
  }

  console.log('Connecting to database...');
  
  try {
    // Create Postgres client
    const client = postgres(connectionString);
    const db = drizzle(client);
    
    console.log('Running database migrations...');
    
    // Run migrations
    await migrate(db, { migrationsFolder: './migrations' });
    
    console.log('✅ Migrations completed successfully!');
    
    // Close the connection
    await client.end();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();