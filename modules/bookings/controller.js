//bookings/controller.js
const bookingService = require("./service");

exports.getAvailableBarbersAndSlots = async (req, res) => {
  try {
    const barbers = await bookingService.getAvailableBarbersAndSlots();
    res.json({ barbers });
  } catch (err) {
    console.error("Get available barbers error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { salon_id, staff_id, date, service_id } = req.query;
    
    console.log("[getAvailableSlots Controller] Request params:", { salon_id, staff_id, date, service_id });
    
    if (!salon_id || !staff_id || !date) {
      console.error("[getAvailableSlots Controller] Missing required parameters");
      return res.status(400).json({ 
        error: "salon_id, staff_id, and date are required",
        received: { salon_id, staff_id, date }
      });
    }
    
    const slots = await bookingService.getAvailableSlots(
      parseInt(salon_id),
      parseInt(staff_id),
      date,
      service_id ? parseInt(service_id) : null
    );
    
    console.log(`[getAvailableSlots Controller] Returning ${slots.length} slots`);
    res.json({ slots });
  } catch (err) {
    console.error("Get available slots error:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ 
      error: err.message || "Failed to get available slots",
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

exports.bookAppointment = async (req, res) => {
  try {
    const { staff_id, salon_id, service_id, scheduled_time } = req.body;
    // Try different ways to get user_id from token
    const user_id = req.user?.user_id || req.user?.id || req.user?.userId;

    if (!user_id) {
      return res.status(400).json({ error: "User ID not found in token" });
    }

    const available = await bookingService.checkSlotAvailability(staff_id, scheduled_time);

    if (!available) {
      return res.status(400).json({ error: "Time slot not available" });
    }

    const appointment_id = await bookingService.bookAppointment(
      user_id,
      salon_id,
      staff_id,
      service_id,
      scheduled_time
    );

    if (!appointment_id) {
      return res.status(500).json({ error: "Failed to create appointment" });
    }

    res.json({ message: "Appointment booked", appointment_id });
  } catch (err) {
    console.error("Book appointment error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.rescheduleAppointment = async (req, res) => {
  try {
    const appointment_id = req.params.id;
    const { new_scheduled_time } = req.body;

    const appt = await bookingService.getAppointmentById(appointment_id);
    if (!appt) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const available = await bookingService.checkRescheduleAvailability(
      appt.staff_id,
      new_scheduled_time,
      appointment_id
    );

    if (!available) {
      return res.status(400).json({ error: "Time slot not available" });
    }

    await bookingService.rescheduleAppointment(appointment_id, new_scheduled_time);
    res.json({ message: "Appointment rescheduled" });
  } catch (err) {
    console.error("Reschedule error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appointment_id = req.params.id;
    await bookingService.cancelAppointment(appointment_id);
    res.json({ message: "Appointment cancelled" });
  } catch (err) {
    console.error("Cancel error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getBarberSchedule = async (req, res) => {
  try {
    // Use staff_id from token if available (staff portal), otherwise look it up
    let staff_id = req.user?.staff_id;
    
    if (!staff_id) {
      const user_id = req.user.user_id || req.user.id;
      staff_id = await bookingService.getStaffIdByUserId(user_id);
    }

    if (!staff_id) {
      return res.status(403).json({ error: "Not a staff member" });
    }

    const schedule = await bookingService.getBarberSchedule(staff_id);
    res.json({ schedule });
  } catch (err) {
    console.error("Get schedule error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.blockTimeSlot = async (req, res) => {
  try {
    // Use staff_id from token if available (staff portal), otherwise look it up
    let staff_id = req.user?.staff_id;
    
    if (!staff_id) {
      const user_id = req.user.user_id || req.user.id;
      staff_id = await bookingService.getStaffIdByUserId(user_id);
    }

    if (!staff_id) {
      return res.status(403).json({ error: "Not a staff member" });
    }

    const { start_datetime, end_datetime, reason } = req.body;

    await bookingService.blockTimeSlot(staff_id, start_datetime, end_datetime, reason);
    res.json({ message: "Time slot blocked" });
  } catch (err) {
    console.error("Block slot error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getBlockedTimeSlots = async (req, res) => {
  try {
    // Use staff_id from token if available (staff portal), otherwise look it up
    let staff_id = req.user?.staff_id;
    
    if (!staff_id) {
      const user_id = req.user.user_id || req.user.id;
      staff_id = await bookingService.getStaffIdByUserId(user_id);
    }

    if (!staff_id) {
      return res.status(403).json({ error: "Not a staff member" });
    }

    const blockedSlots = await bookingService.getBlockedTimeSlots(staff_id);
    res.json({ blockedSlots });
  } catch (err) {
    console.error("Get blocked slots error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateBlockedTimeSlot = async (req, res) => {
  try {
    // Use staff_id from token if available (staff portal), otherwise look it up
    let staff_id = req.user?.staff_id;
    
    if (!staff_id) {
      const user_id = req.user.user_id || req.user.id;
      staff_id = await bookingService.getStaffIdByUserId(user_id);
    }

    if (!staff_id) {
      return res.status(403).json({ error: "Not a staff member" });
    }

    const { timeoff_id } = req.params;
    const { start_datetime, end_datetime, reason } = req.body;

    if (!start_datetime || !end_datetime) {
      return res.status(400).json({ error: "Start and end datetime are required" });
    }

    await bookingService.updateBlockedTimeSlot(staff_id, timeoff_id, start_datetime, end_datetime, reason);
    res.json({ message: "Time slot updated successfully" });
  } catch (err) {
    console.error("Update blocked slot error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBlockedTimeSlot = async (req, res) => {
  try {
    // Use staff_id from token if available (staff portal), otherwise look it up
    let staff_id = req.user?.staff_id;
    
    if (!staff_id) {
      const user_id = req.user.user_id || req.user.id;
      staff_id = await bookingService.getStaffIdByUserId(user_id);
    }

    if (!staff_id) {
      return res.status(403).json({ error: "Not a staff member" });
    }

    const { timeoff_id } = req.params;

    await bookingService.deleteBlockedTimeSlot(staff_id, timeoff_id);
    res.json({ message: "Time slot deleted successfully" });
  } catch (err) {
    console.error("Delete blocked slot error:", err);
    res.status(500).json({ error: err.message });
  }
};

