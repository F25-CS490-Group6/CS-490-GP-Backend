// Script to check and retroactively award loyalty points
const { db } = require("../config/database");
const loyaltyService = require("../modules/loyalty/service");

async function checkLoyaltyPoints() {
  try {
    // Find user by email
    const userEmail = "shahinhm483@gmail.com";
    const [users] = await db.query("SELECT user_id, full_name FROM users WHERE email = ?", [userEmail]);
    
    if (users.length === 0) {
      console.log("User not found");
      return;
    }
    
    const userId = users[0].user_id;
    console.log(`\n=== Checking loyalty points for user ${userId} (${users[0].full_name}) ===\n`);
    
    // Check existing loyalty points
    const [loyaltyRecords] = await db.query(
      `SELECT l.*, s.name as salon_name 
       FROM loyalty l 
       JOIN salons s ON l.salon_id = s.salon_id 
       WHERE l.user_id = ?`,
      [userId]
    );
    
    console.log("Existing loyalty points:");
    if (loyaltyRecords.length === 0) {
      console.log("  No loyalty points found");
    } else {
      loyaltyRecords.forEach(record => {
        console.log(`  Salon: ${record.salon_name} (ID: ${record.salon_id}) - Points: ${record.points}`);
      });
    }
    
    // Find "rezo hair salon" or similar
    const [salons] = await db.query(
      "SELECT salon_id, name FROM salons WHERE name LIKE ?",
      ["%rezo%"]
    );
    
    console.log("\nSalons matching 'rezo':");
    salons.forEach(salon => {
      console.log(`  ${salon.name} (ID: ${salon.salon_id})`);
    });
    
    // Check paid appointments for this user
    const [paidAppointments] = await db.query(
      `SELECT a.appointment_id, a.salon_id, a.scheduled_time, a.price, s.name as salon_name, p.payment_id, p.amount, p.payment_status
       FROM appointments a
       JOIN payments p ON p.appointment_id = a.appointment_id
       JOIN salons s ON a.salon_id = s.salon_id
       WHERE a.user_id = ? 
       AND p.payment_status = 'completed'
       ORDER BY a.scheduled_time DESC
       LIMIT 20`,
      [userId]
    );
    
    console.log(`\nPaid appointments (last 20):`);
    if (paidAppointments.length === 0) {
      console.log("  No paid appointments found");
    } else {
      paidAppointments.forEach(apt => {
        console.log(`  Appointment ${apt.appointment_id}: ${apt.salon_name} (ID: ${apt.salon_id}) - $${apt.amount} - ${apt.scheduled_time}`);
      });
    }
    
    // Check if we need to retroactively award points
    if (paidAppointments.length > 0) {
      console.log("\n=== Checking which appointments need loyalty points ===\n");
      
      for (const apt of paidAppointments) {
        const existingPoints = await loyaltyService.getLoyaltyPoints(userId, apt.salon_id);
        console.log(`Appointment ${apt.appointment_id} at ${apt.salon_name}:`);
        console.log(`  Payment: $${apt.amount}`);
        console.log(`  Current points: ${existingPoints}`);
        
        // Calculate what points should be awarded
        const config = await loyaltyService.getLoyaltyConfig(apt.salon_id);
        const pointsFromAmount = Math.floor(apt.amount * config.points_per_dollar);
        const totalPoints = pointsFromAmount + config.points_per_visit;
        console.log(`  Should award: ${totalPoints} points (${pointsFromAmount} from amount + ${config.points_per_visit} bonus)`);
        
        // Award points retroactively
        console.log(`  Awarding ${totalPoints} points retroactively...`);
        await loyaltyService.awardPointsForPurchase(userId, apt.salon_id, apt.amount);
        
        const newPoints = await loyaltyService.getLoyaltyPoints(userId, apt.salon_id);
        console.log(`  New total points: ${newPoints}\n`);
      }
    }
    
    // Final summary
    console.log("\n=== Final Loyalty Points Summary ===\n");
    const [finalRecords] = await db.query(
      `SELECT l.*, s.name as salon_name 
       FROM loyalty l 
       JOIN salons s ON l.salon_id = s.salon_id 
       WHERE l.user_id = ?
       ORDER BY l.points DESC`,
      [userId]
    );
    
    if (finalRecords.length === 0) {
      console.log("  No loyalty points");
    } else {
      finalRecords.forEach(record => {
        console.log(`  ${record.salon_name}: ${record.points} points`);
      });
    }
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

checkLoyaltyPoints();

