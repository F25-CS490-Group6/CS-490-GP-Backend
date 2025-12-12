const bcrypt = require("bcrypt");
const { db } = require("../config/database");

async function createAdmin() {
  console.log("\n🔐 Creating Admin Account...\n");

  const adminData = {
    full_name: "StyGo Admin",
    email: "stygo.notification@gmail.com",
    password: "stygo1",
    phone: "0000000000",
  };

  try {
    // Check if admin already exists
    const [existingUser] = await db.query(
      "SELECT user_id, user_role FROM users WHERE email = ?",
      [adminData.email]
    );

    if (existingUser.length > 0) {
      const user = existingUser[0];
      
      if (user.user_role === "admin") {
        console.log(`✅ Admin account already exists!`);
        console.log(`   Email: ${adminData.email}`);
        console.log(`   User ID: ${user.user_id}`);
        console.log(`\n💡 You can log in with:`);
        console.log(`   Email: ${adminData.email}`);
        console.log(`   Password: ${adminData.password}`);
      } else {
        // Update existing user to admin
        await db.query(
          "UPDATE users SET user_role = ? WHERE user_id = ?",
          ["admin", user.user_id]
        );
        console.log(`✅ Updated existing user to admin role!`);
        console.log(`   Email: ${adminData.email}`);
        console.log(`   User ID: ${user.user_id}`);
      }
      
      // Update password in auth table
      const hash = await bcrypt.hash(adminData.password, 10);
      await db.query(
        "UPDATE auth SET password_hash = ? WHERE user_id = ?",
        [hash, user.user_id]
      );
      console.log(`✅ Password updated successfully!`);
      
    } else {
      // Create new admin user
      const [userResult] = await db.query(
        "INSERT INTO users (full_name, phone, email, user_role) VALUES (?, ?, ?, ?)",
        [adminData.full_name, adminData.phone, adminData.email, "admin"]
      );
      const userId = userResult.insertId;

      // Create auth record
      const hash = await bcrypt.hash(adminData.password, 10);
      await db.query(
        "INSERT INTO auth (user_id, email, password_hash) VALUES (?, ?, ?)",
        [userId, adminData.email, hash]
      );

      console.log(`✅ Admin account created successfully!`);
      console.log(`   User ID: ${userId}`);
      console.log(`   Email: ${adminData.email}`);
      console.log(`   Role: admin`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("🔑 ADMIN LOGIN CREDENTIALS");
    console.log("=".repeat(60));
    console.log(`Email:    ${adminData.email}`);
    console.log(`Password: ${adminData.password}`);
    console.log(`Role:     Administrator`);
    console.log("=".repeat(60));
    console.log("\n✅ Admin account is ready to use!\n");

  } catch (error) {
    console.error("\n❌ Error creating admin:", error.message);
    throw error;
  } finally {
    await db.end();
  }
}

createAdmin();

