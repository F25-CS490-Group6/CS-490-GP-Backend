const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'salon_platform',
      multipleStatements: true
    });

    console.log('Connected to database');

    // Read the migration file
    const migrationPath = path.join(__dirname, '../database/alter-service-photos-allow-null-appointment.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running migration: alter-service-photos-allow-null-appointment.sql');
    
    // Execute the migration
    await connection.query(sql);
    
    console.log('Migration completed successfully!');
    console.log('appointment_id column is now nullable in service_photos table');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

runMigration();

