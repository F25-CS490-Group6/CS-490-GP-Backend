// Script to check and optionally remove admin users
require("dotenv").config();
const { db } = require("../config/database");

async function checkAdmins() {
  try {
    console.log("Checking for admin users...\n");
    
    const [admins] = await db.query(
      "SELECT user_id, email, full_name, user_role, created_at FROM users WHERE user_role = 'admin'"
    );

    if (admins.length === 0) {
      console.log("✅ No admin users found. You can create one using /setup-admin");
      process.exit(0);
    }

    console.log(`Found ${admins.length} admin user(s):\n`);
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ID: ${admin.user_id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.full_name}`);
      console.log(`   Created: ${admin.created_at}\n`);
    });

    // Check if user wants to remove them
    const args = process.argv.slice(2);
    if (args.includes("--remove")) {
      console.log("Removing all admin users...");
      const [result] = await db.query(
        "DELETE FROM users WHERE user_role = 'admin'"
      );
      console.log(`✅ Removed ${result.affectedRows} admin user(s)`);
      console.log("You can now create a new admin using /setup-admin");
    } else {
      console.log("To remove all admin users, run:");
      console.log("  node scripts/check-admins.js --remove");
      console.log("\nOr remove specific admin by email:");
      console.log("  node scripts/remove-admin.js <email>");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkAdmins();

