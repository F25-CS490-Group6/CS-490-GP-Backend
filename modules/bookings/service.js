//bookings/service.js
const { db } = require("../../config/database");

exports.getAvailableBarbersAndSlots = async () => {
  const salonService = require("../salons/service");
  const [barbers] = await db.query(
    `SELECT staff.staff_id, users.full_name, staff.specialization, staff.salon_id
     FROM staff 
     JOIN users ON staff.user_id = users.user_id
     WHERE staff.role = 'barber' AND staff.is_active = TRUE`
  );

  const today = new Date();
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }

  let allSlots = [];
  for (const barber of barbers) {
    const barberSlots = [];

    for (const day of days) {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayName = dayNames[day.getDay()];
      const [avails] = await db.query(
        `SELECT * FROM staff_availability WHERE staff_id = ? AND day_of_week = ? AND is_available = TRUE`,
        [barber.staff_id, dayName]
      );
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      
      const [timeoffs] = await db.query(
        `SELECT * FROM staff_time_off WHERE staff_id = ? AND status = 'approved' AND 
         ((start_datetime <= ? AND end_datetime >= ?) OR (start_datetime >= ? AND start_datetime <= ?))`,
        [
          barber.staff_id,
          day,
          day,
          day,
          nextDay,
        ]
      );
      const [apps] = await db.query(
        `SELECT 
          a.appointment_id,
          a.staff_id,
          a.scheduled_time,
          a.status,
          COALESCE(SUM(aps.duration), 30) as duration_minutes
         FROM appointments a
         LEFT JOIN appointment_services aps ON a.appointment_id = aps.appointment_id
         WHERE a.staff_id = ? 
         AND a.status IN ('pending', 'confirmed', 'booked')
         AND a.scheduled_time BETWEEN ? AND ?
         GROUP BY a.appointment_id, a.staff_id, a.scheduled_time, a.status`,
        [barber.staff_id, day, nextDay]
      );
      for (const avail of avails) {
        const startTimeParts = avail.start_time.split(":");
        const startHour = parseInt(startTimeParts[0]);
        const startMin = parseInt(startTimeParts[1]);
        
        const endTimeParts = avail.end_time.split(":");
        const endHour = parseInt(endTimeParts[0]);
        const endMin = parseInt(endTimeParts[1]);

        const start = new Date(day);
        start.setHours(startHour, startMin, 0);

        const end = new Date(day);
        end.setHours(endHour, endMin, 0);

      // Get salon slot settings (duration and buffer time)
      const slotSettings = await salonService.getSalonSlotSettings(barber.salon_id);
      const slotDuration = slotSettings.slotDuration || 30; // Default to 30 minutes
      const bufferTime = slotSettings.bufferTime || 0; // Default to 0 minutes

      let slot = new Date(start);

      while (slot < end) {
        const slotEnd = new Date(slot.getTime() + slotDuration * 60000);

        let blocked = false;
        for (let i = 0; i < timeoffs.length; i++) {
          const t = timeoffs[i];
          if (new Date(t.start_datetime) < slotEnd && new Date(t.end_datetime) > slot) {
            blocked = true;
            break;
          }
        }

        let booked = false;
        for (let i = 0; i < apps.length; i++) {
          const a = apps[i];
          const appointmentStart = new Date(a.scheduled_time);
          const appointmentDuration = (a.duration_minutes || slotDuration) * 60000; // Convert minutes to milliseconds
          const appointmentEnd = new Date(appointmentStart.getTime() + appointmentDuration);
          
          // Check if appointment overlaps with slot (including buffer time)
          // Account for buffer time: slot is blocked if appointment is within buffer time of slot
          const slotWithBuffer = new Date(slot.getTime() - bufferTime * 60000);
          const slotEndWithBuffer = new Date(slotEnd.getTime() + bufferTime * 60000);
          
          if (appointmentStart < slotEndWithBuffer && appointmentEnd > slotWithBuffer) {
            booked = true;
            break;
          }
        }

        if (!blocked && !booked && slotEnd <= end) {
          const dateStr = day.toISOString().split("T")[0];
          const timeStr = slot.toTimeString();
          const startTime = timeStr.substring(0, 5);
          const endTimeStr = slotEnd.toTimeString();
          const endTime = endTimeStr.substring(0, 5);
          
          barberSlots.push({
            date: dateStr,
            start_time: startTime,
            end_time: endTime,
          });
        }

        // Move to next slot, accounting for buffer time
        slot = new Date(slotEnd.getTime() + bufferTime * 60000);
      }
      }
    }

    allSlots.push({
      barber_id: barber.staff_id,
      barber_name: barber.full_name,
      salon_id: barber.salon_id,
      slots: barberSlots,
    });
  }

  return allSlots;
};

/**
 * Get available time slots for a specific salon, staff member, date, and service
 */
exports.getAvailableSlots = async (salon_id, staff_id, date, service_id = null) => {
  const salonService = require("../salons/service");
  
  // Parse the date (format: YYYY-MM-DD) as local date, not UTC
  const dateParts = date.split('-');
  const selectedDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = dayNames[selectedDate.getDay()];
  
  console.log(`[getAvailableSlots] salon_id: ${salon_id}, staff_id: ${staff_id}, date: ${date}, dayName: ${dayName}`);
  
  // Get business hours for the salon
  const businessHours = await salonService.getSalonBusinessHours(salon_id);
  const dayHours = businessHours[dayName.toLowerCase()];
  
  // If salon is closed on this day, return empty slots
  // BUT: if staff has availability set, we should still check it (staff might work even if salon is "closed")
  if (!dayHours || dayHours.closed) {
    console.log(`[getAvailableSlots] Salon business hours show closed on ${dayName}, checking staff availability...`);
    // Don't return empty yet - check if staff has availability first
  }
  
  // Get staff availability for this day
  const [avails] = await db.query(
    `SELECT * FROM staff_availability 
     WHERE staff_id = ? AND day_of_week = ? AND is_available = TRUE`,
    [staff_id, dayName]
  );
  
  console.log(`[getAvailableSlots] Found ${avails.length} availability records for staff ${staff_id} on ${dayName}`);
  
  // If no staff availability, use business hours or default hours
  let startTime, endTime;
  if (avails && avails.length > 0) {
    const avail = avails[0];
    // Handle TIME format from database (HH:MM:SS) - convert to HH:MM
    startTime = typeof avail.start_time === 'string' 
      ? avail.start_time.substring(0, 5) 
      : avail.start_time;
    endTime = typeof avail.end_time === 'string'
      ? avail.end_time.substring(0, 5)
      : avail.end_time;
    console.log(`[getAvailableSlots] Using staff availability: ${startTime} - ${endTime}`);
  } else if (dayHours && dayHours.open && dayHours.close && !dayHours.closed) {
    // Use salon business hours if available and not closed
    startTime = dayHours.open;
    endTime = dayHours.close;
    console.log(`[getAvailableSlots] Using business hours: ${startTime} - ${endTime}`);
  } else {
    // If staff hasn't set availability, always use default hours (9 AM - 5 PM)
    // This ensures customers can book even when staff availability isn't configured
    startTime = "09:00";
    endTime = "17:00";
    console.log(`[getAvailableSlots] Staff availability not set - using default hours: ${startTime} - ${endTime}`);
  }
  
  // Get service duration if service_id is provided
  let serviceDuration = 30; // Default 30 minutes
  if (service_id) {
    const [services] = await db.query(
      "SELECT duration FROM services WHERE service_id = ? AND is_active = 1",
      [service_id]
    );
    if (services && services.length > 0) {
      serviceDuration = services[0].duration || 30;
    }
  }
  
  // Get salon slot settings
  const slotSettings = await salonService.getSalonSlotSettings(salon_id);
  const slotDuration = slotSettings.slotDuration || 30;
  const bufferTime = slotSettings.bufferTime || 0;
  
  // Use service duration or slot duration, whichever is larger
  const effectiveDuration = Math.max(serviceDuration, slotDuration);
  
  // Get existing appointments for this staff on this date
  const dayStart = new Date(selectedDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(selectedDate);
  dayEnd.setHours(23, 59, 59, 999);
  
  const [appointments] = await db.query(
    `SELECT 
      a.appointment_id,
      a.scheduled_time,
      a.status,
      COALESCE(SUM(aps.duration), ?) as duration_minutes
     FROM appointments a
     LEFT JOIN appointment_services aps ON a.appointment_id = aps.appointment_id
     WHERE a.staff_id = ? 
     AND a.status IN ('pending', 'confirmed', 'booked')
     AND a.scheduled_time >= ? AND a.scheduled_time < ?
     GROUP BY a.appointment_id, a.scheduled_time, a.status`,
    [effectiveDuration, staff_id, dayStart, dayEnd]
  );
  
  // Get staff time off for this date
  const [timeoffs] = await db.query(
    `SELECT * FROM staff_time_off 
     WHERE staff_id = ? AND status = 'approved' 
     AND start_datetime < ? AND end_datetime > ?`,
    [staff_id, dayEnd, dayStart]
  );
  
  // Parse start and end times (handle both HH:MM and HH:MM:SS formats)
  const startTimeStr = String(startTime).substring(0, 5); // Ensure HH:MM format
  const startTimeParts = startTimeStr.split(":");
  const startHour = parseInt(startTimeParts[0]);
  const startMin = parseInt(startTimeParts[1]);
  
  const endTimeStr = String(endTime).substring(0, 5); // Ensure HH:MM format
  const endTimeParts = endTimeStr.split(":");
  const endHour = parseInt(endTimeParts[0]);
  const endMin = parseInt(endTimeParts[1]);
  
  const start = new Date(selectedDate);
  start.setHours(startHour, startMin, 0);
  
  const end = new Date(selectedDate);
  end.setHours(endHour, endMin, 0);
  
  // Generate available slots
  const availableSlots = [];
  const now = new Date();
  let slot = new Date(start);
  
  while (slot < end) {
    const slotEnd = new Date(slot.getTime() + effectiveDuration * 60000);
    
    // Check if slot extends beyond business hours
    if (slotEnd > end) {
      break;
    }
    
    // Skip past time slots (if the slot end time is in the past, skip it)
    if (slotEnd <= now) {
      // Move to next slot (accounting for buffer time)
      slot = new Date(slotEnd.getTime() + bufferTime * 60000);
      continue;
    }
    
    // Check if slot is blocked by time off
    let blocked = false;
    for (const timeoff of timeoffs) {
      const timeoffStart = new Date(timeoff.start_datetime);
      const timeoffEnd = new Date(timeoff.end_datetime);
      
      if (slot < timeoffEnd && slotEnd > timeoffStart) {
        blocked = true;
        break;
      }
    }
    
    // Check if slot is booked
    let booked = false;
    for (const appointment of appointments) {
      const appointmentStart = new Date(appointment.scheduled_time);
      const appointmentDuration = (appointment.duration_minutes || effectiveDuration) * 60000;
      const appointmentEnd = new Date(appointmentStart.getTime() + appointmentDuration);
      
      // Account for buffer time
      const slotWithBuffer = new Date(slot.getTime() - bufferTime * 60000);
      const slotEndWithBuffer = new Date(slotEnd.getTime() + bufferTime * 60000);
      
      if (appointmentStart < slotEndWithBuffer && appointmentEnd > slotWithBuffer) {
        booked = true;
        break;
      }
    }
    
    // Add slot if available
    if (!blocked && !booked) {
      const timeStr = slot.toTimeString();
      const time = timeStr.substring(0, 5); // HH:MM format
      availableSlots.push(time);
    }
    
    // Move to next slot (accounting for buffer time)
    slot = new Date(slotEnd.getTime() + bufferTime * 60000);
  }
  
  console.log(`[getAvailableSlots] Generated ${availableSlots.length} available slots:`, availableSlots);
  
  return availableSlots;
};

exports.checkSlotAvailability = async (staff_id, scheduled_time) => {
  // Check if there's already an active appointment that overlaps with this time
  // Include pending, confirmed, and booked statuses as they all block the slot
  // Check for appointments that start within 30 minutes before or after the requested time
  // This accounts for typical service durations and prevents double-booking
  const scheduledTime = new Date(scheduled_time);
  const windowStart = new Date(scheduledTime.getTime() - 30 * 60000); // 30 min before
  const windowEnd = new Date(scheduledTime.getTime() + 30 * 60000); // 30 min after
  
  const [overlapping] = await db.query(
    `SELECT COUNT(*) as count FROM appointments a
     WHERE a.staff_id = ? 
     AND a.status IN ('pending', 'confirmed', 'booked')
     AND a.scheduled_time BETWEEN ? AND ?`,
    [staff_id, windowStart, windowEnd]
  );
  
  // Also check for time off that overlaps
  const [timeoffCount] = await db.query(
    `SELECT COUNT(*) as count FROM staff_time_off 
     WHERE staff_id = ? AND status = 'approved' 
     AND start_datetime <= ? AND end_datetime >= ?`,
    [staff_id, scheduled_time, scheduled_time]
  );
  
  if (overlapping[0].count === 0 && timeoffCount[0].count === 0) {
    return true;
  }
  return false;
};

exports.bookAppointment = async (user_id, salon_id, staff_id, service_id, scheduled_time) => {
  // Validate user_id
  if (!user_id || user_id === null || user_id === undefined) {
    throw new Error("User ID is required");
  }
  
  const result = await db.query(
    `INSERT INTO appointments (user_id, salon_id, staff_id, scheduled_time, status)
     VALUES (?, ?, ?, ?, 'booked')`,
    [user_id, salon_id, staff_id, scheduled_time]
  );
  // MySQL2 returns [result, fields] where result has insertId
  const insertResult = Array.isArray(result) ? result[0] : result;
  if (insertResult && insertResult.insertId) {
    const appointmentId = insertResult.insertId;

    if (service_id) {
      // add entry in appointment_services for pricing/duration
      const [svc] = await db.query(
        "SELECT duration, price FROM services WHERE service_id = ?",
        [service_id]
      );
      await db.query(
        `
        INSERT INTO appointment_services (appointment_id, service_id, duration, price)
        VALUES (?, ?, ?, ?)
        `,
        [
          appointmentId,
          service_id,
          svc?.[0]?.duration || null,
          svc?.[0]?.price || null,
        ]
      );
    }

    return appointmentId;
  }
  return null;
};

exports.getAppointmentById = async (appointment_id) => {
  const [rows] = await db.query(
    `SELECT * FROM appointments WHERE appointment_id = ?`,
    [appointment_id]
  );
  return rows[0];
};

exports.rescheduleAppointment = async (appointment_id, new_scheduled_time) => {
  await db.query(
    `UPDATE appointments SET scheduled_time = ?, status = 'booked' WHERE appointment_id = ?`,
    [new_scheduled_time, appointment_id]
  );
};

exports.checkRescheduleAvailability = async (staff_id, new_scheduled_time, appointment_id) => {
  const [count] = await db.query(
    `SELECT COUNT(*) AS count FROM appointments 
     WHERE staff_id = ? AND status = 'booked' AND scheduled_time = ? AND appointment_id != ?`,
    [staff_id, new_scheduled_time, appointment_id]
  );
  if (count[0].count === 0) {
    return true;
  }
  return false;
};

exports.cancelAppointment = async (appointment_id) => {
  await db.query(
    `UPDATE appointments SET status = 'cancelled' WHERE appointment_id = ?`,
    [appointment_id]
  );
};

exports.getBarberSchedule = async (staff_id) => {
  const [apps] = await db.query(
    `SELECT 
        a.appointment_id, 
        a.status, 
        a.scheduled_time, 
        GROUP_CONCAT(s.custom_name SEPARATOR ', ') AS service_name, 
        u.full_name AS customer_name
     FROM appointments a
     LEFT JOIN appointment_services aps ON a.appointment_id = aps.appointment_id
     LEFT JOIN services s ON aps.service_id = s.service_id
     LEFT JOIN users u ON a.user_id = u.user_id
     WHERE a.staff_id = ? AND DATE(a.scheduled_time) = CURDATE() AND a.status = 'booked'
     GROUP BY a.appointment_id
     ORDER BY a.scheduled_time`,
    [staff_id]
  );
  return apps;
};

exports.getStaffIdByUserId = async (user_id) => {
  const [rows] = await db.query(
    `SELECT staff_id FROM staff WHERE user_id = ?`,
    [user_id]
  );
  if (rows[0] && rows[0].staff_id) {
    return rows[0].staff_id;
  }
  return null;
};

exports.blockTimeSlot = async (staff_id, start_datetime, end_datetime, reason) => {
  const [result] = await db.query(
    `INSERT INTO staff_time_off (staff_id, start_datetime, end_datetime, reason, status)
     VALUES (?, ?, ?, ?, 'approved')`,
    [staff_id, start_datetime, end_datetime, reason || "Blocked time slot"]
  );
  return result.insertId;
};

exports.getBlockedTimeSlots = async (staff_id) => {
  const [timeoffs] = await db.query(
    `SELECT 
      timeoff_id,
      staff_id,
      start_datetime,
      end_datetime,
      reason,
      status,
      created_at
     FROM staff_time_off
     WHERE staff_id = ? AND status = 'approved' AND end_datetime > NOW()
     ORDER BY start_datetime DESC`,
    [staff_id]
  );
  return timeoffs;
};

exports.updateBlockedTimeSlot = async (staff_id, timeoff_id, start_datetime, end_datetime, reason) => {
  // Verify the timeoff belongs to this staff member
  const [existing] = await db.query(
    `SELECT timeoff_id FROM staff_time_off WHERE timeoff_id = ? AND staff_id = ?`,
    [timeoff_id, staff_id]
  );

  if (!existing || existing.length === 0) {
    throw new Error("Time slot not found or you don't have permission to edit it");
  }

  await db.query(
    `UPDATE staff_time_off 
     SET start_datetime = ?, end_datetime = ?, reason = ?
     WHERE timeoff_id = ? AND staff_id = ?`,
    [start_datetime, end_datetime, reason || null, timeoff_id, staff_id]
  );
  
  return { success: true };
};

exports.deleteBlockedTimeSlot = async (staff_id, timeoff_id) => {
  // Verify the timeoff belongs to this staff member
  const [existing] = await db.query(
    `SELECT timeoff_id FROM staff_time_off WHERE timeoff_id = ? AND staff_id = ?`,
    [timeoff_id, staff_id]
  );

  if (!existing || existing.length === 0) {
    throw new Error("Time slot not found or you don't have permission to delete it");
  }

  await db.query(
    `DELETE FROM staff_time_off WHERE timeoff_id = ? AND staff_id = ?`,
    [timeoff_id, staff_id]
  );
  
  return { success: true };
};
