// Script to remove a specific admin user by email
require("dotenv").config();
const { db } = require("../config/database");

async function removeAdmin() {
  try {
    const email = process.argv[2];

    if (!email) {
      console.error("Usage: node scripts/remove-admin.js <email>");
      process.exit(1);
    }

    console.log(`Checking for admin user with email: ${email}...\n`);

    const [users] = await db.query(
      "SELECT user_id, email, full_name, user_role FROM users WHERE email = ? AND user_role = 'admin'",
      [email]
    );

    if (users.length === 0) {
      console.log(`❌ No admin user found with email: ${email}`);
      process.exit(1);
    }

    const user = users[0];
    console.log(`Found admin user:`);
    console.log(`  ID: ${user.user_id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.full_name}\n`);

    console.log("Removing admin user...");
    const [result] = await db.query(
      "DELETE FROM users WHERE user_id = ? AND user_role = 'admin'",
      [user.user_id]
    );

    if (result.affectedRows > 0) {
      console.log(`✅ Successfully removed admin user: ${email}`);
      console.log("You can now create a new admin using /setup-admin");
    } else {
      console.log(`❌ Failed to remove admin user`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

removeAdmin();

