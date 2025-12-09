// Script to run the migration to add salon_id to service_photos table
const { db } = require("../config/database");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  try {
    console.log("Starting migration: Add salon_id to service_photos table...");
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, "../database/add-salon-id-to-service-photos.sql");
    const sql = fs.readFileSync(sqlFile, "utf8");
    
    // Split by semicolon and filter out empty statements
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.length > 0) {
        try {
          await db.query(statement);
          console.log("✓ Executed:", statement.substring(0, 50) + "...");
        } catch (err) {
          // Check if it's a "duplicate column" error (already exists)
          if (err.code === "ER_DUP_FIELDNAME" || err.message.includes("Duplicate column name")) {
            console.log("⚠ Column already exists, skipping:", statement.substring(0, 50) + "...");
          } else if (err.code === "ER_DUP_KEYNAME" || err.message.includes("Duplicate key name")) {
            console.log("⚠ Index already exists, skipping:", statement.substring(0, 50) + "...");
          } else if (err.code === "ER_DUP_KEY" || err.message.includes("Duplicate key")) {
            console.log("⚠ Constraint already exists, skipping:", statement.substring(0, 50) + "...");
          } else {
            console.error("✗ Error executing statement:", err.message);
            console.error("Statement:", statement.substring(0, 100));
            throw err;
          }
        }
      }
    }
    
    console.log("\n✅ Migration completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Migration failed:", err.message);
    process.exit(1);
  }
}

runMigration();

