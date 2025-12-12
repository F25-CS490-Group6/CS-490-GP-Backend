const { query, db } = require("../../config/database");
const appointmentService = require("./service");
const { sendEmail } = require("../../services/email");
const {
  buildAppointmentLink,
  buildPasswordSetupLink,
  buildSignInLink,
} = require("../../services/customerPortalLinks");
const notificationService = require("../notifications/service");
const salonService = require("../salons/service");

// Helper functions
const formatAppointmentDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getSalonName = (salonInfo) => {
  return salonInfo?.name || salonInfo?.salon_name || "the salon";
};

const getCustomerName = (
  firstName,
  lastName,
  customerFullName,
  fallback = "A customer"
) => {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  return customerFullName || fallback;
};

/**
 * Create Appointment
 * - Customers can book for themselves
 * - Staff/Owners can book on behalf of customers
 * - If no staffId provided, auto-assign the least busy available staff
 */

exports.createAppointment = async (req, res) => {
  try {
    const {
      salonId,
      salon_id,
      staffId,
      staff_id,
      serviceId,
      service_id,
      services,
      scheduledTime,
      scheduled_time,
      price,
      notes,
      status,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zip,
    } = req.body;

    // Support both camelCase and snake_case field names
    const finalSalonId = salonId || salon_id;
    const finalStaffId = staffId || staff_id;
    const finalServiceId = serviceId || service_id;
    const finalScheduledTime = scheduledTime || scheduled_time;

    const role = req.user?.role || req.user?.user_role;
    const tokenSalonId = req.user?.salon_id;
    const tokenUserId = req.user?.user_id || req.user?.id;
    const resolvedSalonId = finalSalonId || tokenSalonId;

    // Get user email and phone from token if not provided
    let userEmail = email;
    let userPhone = phone;

    if (tokenUserId && (!userEmail || !userPhone)) {
      // Fetch user info from database if not provided in request
      const [userRows] = await db.query(
        "SELECT email, phone FROM users WHERE user_id = ?",
        [tokenUserId]
      );
      if (userRows && userRows.length > 0) {
        userEmail = userEmail || userRows[0].email;
        userPhone = userPhone || userRows[0].phone;
      }
    }

    // Validate either serviceId or services array
    if (
      !resolvedSalonId ||
      (!finalServiceId && !Array.isArray(services)) ||
      !finalScheduledTime ||
      !userEmail ||
      !userPhone
    ) {
      return res.status(400).json({
        error:
          "Missing required fields (email, phone, service, time). Please ensure your profile has email and phone.",
      });
    }

    // Check booking settings: advance booking days limit and deposit requirement
    const salonService = require("../salons/service");
    const bookingSettings = await salonService.getSalonBookingSettings(resolvedSalonId);
    const slotSettings = await salonService.getSalonSlotSettings(resolvedSalonId);
    
    // Validate advance booking days
    const scheduledDate = new Date(finalScheduledTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysDifference = Math.ceil((scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference > bookingSettings.advanceBookingDays) {
      return res.status(400).json({
        error: `Appointments can only be booked up to ${bookingSettings.advanceBookingDays} days in advance.`,
      });
    }

    if (daysDifference < 0) {
      return res.status(400).json({
        error: "Cannot book appointments in the past.",
      });
    }

    // Deposit requirement removed - no longer checking for deposits

    // Check subscription limits for appointment creation
    // Only check if user is owner/admin creating appointment for their salon
    if (role === "owner" || role === "admin") {
      const subscriptionLimits = require("../account/subscriptionLimits");
      // Get owner from salon
      const [salonRows] = await db.query(
        "SELECT owner_id FROM salons WHERE salon_id = ?",
        [resolvedSalonId]
      );

      if (salonRows && salonRows.length > 0) {
        const ownerId = salonRows[0].owner_id;
        const appointmentCheck = await subscriptionLimits.canCreateAppointment(
          ownerId,
          resolvedSalonId
        );
        if (!appointmentCheck.allowed) {
          return res.status(403).json({
            error: appointmentCheck.message,
            current: appointmentCheck.current,
            limit: appointmentCheck.limit,
          });
        }
      }
    }

    let userId;
    let customerFullName;
    let isNewCustomer = false;

    // Prioritize authenticated user's ID to ensure appointments show in their profile
    if (tokenUserId) {
      const [userInfo] = await db.query(
        "SELECT user_id, full_name FROM users WHERE user_id = ?",
        [tokenUserId]
      );
      if (userInfo && userInfo.length > 0) {
        userId = userInfo[0].user_id;
        customerFullName = userInfo[0].full_name;
        isNewCustomer = false;
      } else {
        // User doesn't exist, create new
        const fullName =
          `${firstName || ""} ${lastName || ""}`.trim() || "New Customer";
        const [insert] = await db.query(
          "INSERT INTO users (full_name, phone, email, user_role) VALUES (?, ?, ?, 'customer')",
          [fullName, userPhone, userEmail]
        );
        userId = insert.insertId;
        customerFullName = fullName;
        isNewCustomer = true;
      }
    } else {
      // No authenticated user, check if customer exists by email/phone
      const [existingCustomer] = await db.query(
        "SELECT user_id, full_name FROM users WHERE email = ? OR phone = ? LIMIT 1",
        [userEmail, userPhone]
      );

      if (existingCustomer.length) {
        userId = existingCustomer[0].user_id;
        customerFullName = existingCustomer[0].full_name;
        isNewCustomer = false;
      } else {
        // Create new customer
        const fullName =
          `${firstName || ""} ${lastName || ""}`.trim() || "New Customer";
        const [insert] = await db.query(
          "INSERT INTO users (full_name, phone, email, user_role) VALUES (?, ?, ?, 'customer')",
          [fullName, userPhone, userEmail]
        );
        userId = insert.insertId;
        customerFullName = fullName;
        isNewCustomer = true;
      }
    }

    await db.query(
      `
      INSERT INTO salon_customers (salon_id, user_id, address, city, state, zip, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        address = VALUES(address),
        city = VALUES(city),
        state = VALUES(state),
        zip = VALUES(zip),
        notes = VALUES(notes)
      `,
      [
        resolvedSalonId,
        userId,
        address || null,
        city || null,
        state || null,
        zip || null,
        notes || null,
      ]
    );

    let assignedStaffId = finalStaffId;
    if (!assignedStaffId) {
      const [rows] = await db.query(
        `
        SELECT s.staff_id
        FROM staff s
        LEFT JOIN appointments a 
          ON s.staff_id = a.staff_id 
          AND DATE(a.scheduled_time) = CURDATE()
        WHERE s.salon_id = ? AND s.is_active = 1
        GROUP BY s.staff_id
        ORDER BY COUNT(a.appointment_id) ASC
        LIMIT 1;
        `,
        [resolvedSalonId]
      );

      if (!rows.length) {
        return res
          .status(400)
          .json({ error: "No active staff available for this salon" });
      }

      assignedStaffId = rows[0].staff_id;
    }

    // handle multi or single service gracefully
    const serviceInput =
      Array.isArray(services) && services.length ? services : finalServiceId;

    // All appointments are automatically confirmed when booked
    const finalStatus = "confirmed";

    const appointmentId = await appointmentService.createAppointment(
      userId,
      resolvedSalonId,
      assignedStaffId,
      serviceInput,
      finalScheduledTime,
      price || 0,
      notes,
      finalStatus
    );

    // If deposit was required and paid, create a payment record for the deposit
    if (bookingSettings.requireDeposit && bookingSettings.depositAmount > 0) {
      const depositPaid = req.body.deposit_paid || req.body.depositPaid || false;
      if (depositPaid) {
        const paymentService = require("../payments/service");
        try {
          // Create a payment record for the deposit
          await db.query(
            `INSERT INTO payments (user_id, amount, payment_method, payment_status, appointment_id)
             VALUES (?, ?, 'deposit', 'completed', ?)`,
            [userId, bookingSettings.depositAmount, appointmentId]
          );
        } catch (paymentErr) {
          console.error("Error recording deposit payment:", paymentErr);
          // Don't fail the appointment creation if deposit recording fails
        }
      }
    }

    const [[salonInfo]] = await db.query(
      "SELECT name, address, owner_id FROM salons WHERE salon_id = ?",
      [resolvedSalonId]
    );

    // Send notification to customer
    try {
      const formattedDate = formatAppointmentDate(finalScheduledTime);
      const salonName = getSalonName(salonInfo);

      const customerMessage = `Appointment confirmed for ${salonName} on ${formattedDate}.`;

      await notificationService.createNotification(
        userId,
        "appointment",
        customerMessage
      );
    } catch (notificationError) {
      // Log error but don't fail appointment creation
      console.error("Error creating booking notification:", notificationError);
    }

    // Send notification to salon owner about new appointment
    // Don't notify owner if they created it themselves
    try {
      const ownerId = salonInfo?.owner_id;
      // Check if the authenticated user is the owner (owner creating appointment)
      const isOwnerCreating = ownerId && ownerId === tokenUserId;

      if (ownerId && !isOwnerCreating) {
        // Notify owner about new appointment (owner didn't create it)
        const formattedDate = formatAppointmentDate(finalScheduledTime);
        const customerName = getCustomerName(
          firstName,
          lastName,
          customerFullName
        );
        const ownerMessage = `Appointment requested: ${customerName} on ${formattedDate}`;
        console.log("Sending notification to salon owner:", {
          ownerId: ownerId,
          message: ownerMessage,
          userId: userId,
          tokenUserId: tokenUserId,
          isOwnerCreating: isOwnerCreating,
        });

        await notificationService.createNotification(
          ownerId,
          "appointment",
          ownerMessage
        );
        console.log("Salon owner notification sent successfully");
      } else if (isOwnerCreating) {
        console.log(
          "Owner creating appointment - no owner notification needed"
        );
      }
    } catch (ownerNotificationError) {
      // Log error but don't fail appointment creation
      console.error(
        "Error creating owner notification:",
        ownerNotificationError
      );
    }

    // Pick service names from either array or single
    let serviceSummary = "";
    if (Array.isArray(services)) {
      serviceSummary = services
        .map((s) => s.custom_name || `#${s.service_id}`)
        .join(", ");
    } else {
      const [[serviceInfo]] = await db.query(
        "SELECT custom_name, duration FROM services WHERE service_id = ?",
        [serviceId]
      );
      serviceSummary = serviceInfo?.custom_name || "Selected Service";
    }

    const appointmentLink = buildAppointmentLink(appointmentId);
    const signInLink = buildSignInLink();
    const passwordSetupLink = isNewCustomer
      ? buildPasswordSetupLink(userId, email)
      : null;

    const priceValue = Number(price || 0).toFixed(2);

    // Check if staff/owner created the appointment (not the customer themselves)
    const isStaffOrOwnerCreating = (role === "staff" || role === "owner") && userId !== tokenUserId;

    // If staff/owner created the appointment, send payment email with Stripe link
    // Otherwise, send regular confirmation email
    if (finalStatus === "confirmed") {
      try {
        if (isStaffOrOwnerCreating && price > 0) {
          // Staff/Owner created - send payment email with Stripe link
          const paymentService = require("../payments/service");
          const paymentResult = await paymentService.createCheckoutAndNotify(
            userId,
            parseFloat(price || 0),
            appointmentId,
            0, // No loyalty points for staff-created appointments
            resolvedSalonId
          );
          console.log("Payment email sent to customer:", userEmail, "Payment link:", paymentResult.payment_link);
        } else {
          // Customer created or no price - send regular confirmation email
          const emailHtml = `
            <h2>Appointment Confirmed</h2>
            <p>Dear ${firstName || customerFullName || "Customer"},</p>
            <p>Your appointment at <b>${getSalonName(
              salonInfo
            )}</b> is confirmed.</p>
            <ul>
              <li><b>Services:</b> ${serviceSummary}</li>
              <li><b>Time:</b> ${new Date(
                finalScheduledTime
              ).toLocaleString()}</li>
              <li><b>Total Price:</b> $${Number(price).toFixed(2)}</li>
            </ul>
            <p><b>Salon Address:</b> ${salonInfo?.address || "N/A"}</p>
            <p>We look forward to seeing you!</p>
          `;
          await sendEmail(userEmail, "Your Appointment is Confirmed!", emailHtml);
        }
      } catch (emailError) {
        console.error("Error sending confirmation/payment email:", emailError);
        // Don't fail appointment creation if email fails
      }
    }

    // Schedule reminders for confirmed appointments
    if (finalStatus === "confirmed") {
      try {
        const notificationSettings =
          await salonService.getSalonNotificationSettings(resolvedSalonId);
        const appointmentDate = new Date(finalScheduledTime);
        const reminderHours = notificationSettings.reminderHoursBefore || 24;

        // Calculate reminder time: appointment time - reminder hours
        const reminderTime = new Date(
          appointmentDate.getTime() - reminderHours * 60 * 60 * 1000
        );

        // Only schedule if reminder time is in the future
        if (reminderTime > new Date()) {
          const reminderMessage = `Reminder: You have an appointment at ${getSalonName(
            salonInfo
          )} on ${appointmentDate.toLocaleString()}`;

          // Schedule email reminder if enabled
          if (notificationSettings.emailReminders) {
            await notificationService.sendAppointmentReminder(
              userId,
              reminderMessage,
              reminderTime
            );
          }

          // Schedule in-app reminder if enabled
          if (notificationSettings.inAppReminders) {
            await notificationService.scheduleInAppReminder(
              userId,
              reminderMessage,
              reminderTime
            );
          }
        }
      } catch (reminderError) {
        // Log error but don't fail appointment creation
        console.error("Error scheduling reminders:", reminderError);
      }
    }

    res.status(201).json({
      message: "Appointment created successfully",
      appointmentId,
      assignedStaffId,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: error.message || "Failed to create appointment",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

exports.getUserAppointments = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const appointments = await appointmentService.getAppointmentsByUser(userId);
    res.json({ data: appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Failed to get appointments" });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.user?.role || req.user?.user_role;
    const appointment = await appointmentService.getAppointmentById(id);
    if (!appointment)
      return res.status(404).json({ error: "Appointment not found" });
    if (role === "staff" && appointment.salon_id !== req.user?.salon_id)
      return res.status(403).json({ error: "Forbidden: cross-salon access" });
    if (
      role === "customer" &&
      appointment.user_id !== (req.user?.user_id || req.user?.id)
    )
      return res.status(403).json({ error: "Access denied" });
    res.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ error: "Failed to get appointment" });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.user?.role || req.user?.user_role;
    const updates = req.body;

    console.log("Update appointment request:", {
      id,
      role,
      updates,
      userId: req.user?.user_id,
    });

    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const appointment = await appointmentService.getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // For owners, check if they own the salon
    if (role === "owner") {
      const [[salonInfo]] = await db.query(
        "SELECT owner_id FROM salons WHERE salon_id = ?",
        [appointment.salon_id]
      );
      if (
        salonInfo &&
        salonInfo.owner_id !== req.user?.user_id &&
        salonInfo.owner_id !== req.user?.id
      ) {
        return res
          .status(403)
          .json({ error: "Forbidden: You don't own this salon" });
      }
    }

    if (role === "staff" && appointment.salon_id !== req.user?.salon_id) {
      return res.status(403).json({ error: "Forbidden: cross-salon access" });
    }

    // For customers, check if they own this appointment and only allow rescheduling
    const userId = req.user?.user_id || req.user?.id;
    if (role === "customer") {
      if (appointment.user_id !== userId) {
        return res.status(403).json({ error: "You can only update your own appointments" });
      }
      // Customers can only reschedule (update scheduled_time), not change status or other fields
      if (updates.hasOwnProperty("status") && updates.status !== appointment.status) {
        return res.status(403).json({ error: "Customers cannot change appointment status" });
      }
      // Validate that the new time slot is available before allowing reschedule
      if (timeChanged && oldScheduledTime !== newScheduledTime) {
        const bookingService = require("../bookings/service");
        const available = await bookingService.checkRescheduleAvailability(
          appointment.staff_id,
          newScheduledTime,
          id
        );
        if (!available) {
          return res.status(400).json({ error: "Time slot not available" });
        }
      }
    }

    // If scheduled_time is being updated, cancel old reminders and schedule new ones
    const timeChanged =
      updates.hasOwnProperty("scheduledTime") ||
      updates.hasOwnProperty("scheduled_time");
    const oldScheduledTime = appointment.scheduled_time;
    const newScheduledTime =
      updates.scheduledTime || updates.scheduled_time || oldScheduledTime;

    // Cancel old reminders if time changed
    if (timeChanged && oldScheduledTime !== newScheduledTime) {
      try {
        // Cancel reminders that mention this appointment
        const [[salonInfo]] = await db.query(
          "SELECT name FROM salons WHERE salon_id = ?",
          [appointment.salon_id]
        );
        const salonName = getSalonName(salonInfo);
        await notificationService.cancelScheduledReminders(
          appointment.user_id,
          salonName
        );
      } catch (reminderError) {
        console.error("Error cancelling old reminders:", reminderError);
      }
    }

    const updated = await appointmentService.updateAppointment(id, updates);
    if (!updated)
      return res
        .status(404)
        .json({ error: "Appointment not found or unchanged" });

    // Send notification if appointment status changed
    if (updates.hasOwnProperty("status") && appointment.status === "pending") {
      try {
        const [[salonInfo]] = await db.query(
          "SELECT name, owner_id FROM salons WHERE salon_id = ?",
          [appointment.salon_id]
        );
        const formattedDate = formatAppointmentDate(appointment.scheduled_time);
        const salonName = getSalonName(salonInfo);

        // Get customer name for salon owner notification
        const [[customerInfo]] = await db.query(
          "SELECT full_name FROM users WHERE user_id = ?",
          [appointment.user_id]
        );
        const customerName = customerInfo?.full_name || "Customer";

        if (updates.status === "confirmed") {
          // Appointment confirmed - notify customer
          const confirmedMessage = `Your appointment at ${salonName} on ${formattedDate} has been confirmed.`;
          await notificationService.createNotification(
            appointment.user_id,
            "appointment",
            confirmedMessage
          );
        } else if (updates.status === "completed") {
          // Award loyalty points if loyalty program is enabled
          try {
            const salonService = require("../salons/service");
            const loyaltySettings = await salonService.getSalonLoyaltySettings(appointment.salon_id);
            
            if (loyaltySettings.loyaltyEnabled && loyaltySettings.pointsPerVisit > 0) {
              const loyaltyService = require("../loyalty/service");
              await loyaltyService.earnLoyaltyPoints(
                appointment.user_id,
                appointment.salon_id,
                loyaltySettings.pointsPerVisit
              );
            }

            // Auto-request review if enabled
            const reviewSettings = await salonService.getSalonReviewSettings(appointment.salon_id);
            if (reviewSettings.autoRequestReviews) {
              // Schedule review request based on reviewRequestTiming
              const reviewRequestTime = new Date();
              reviewRequestTime.setHours(
                reviewRequestTime.getHours() + (reviewSettings.reviewRequestTiming || 24)
              );
              
              // Create a notification/reminder for review request
              const reviewMessage = `How was your experience at ${salonName}? Please leave a review!`;
              await notificationService.scheduleInAppReminder(
                appointment.user_id,
                reviewMessage,
                reviewRequestTime
              );
            }
          } catch (loyaltyError) {
            console.error("Error processing loyalty/review for completed appointment:", loyaltyError);
            // Don't fail the status update if loyalty/review processing fails
          }
        } else if (updates.status === "cancelled") {
          // Appointment denied/cancelled - notify customer
          const deniedMessage = `Your appointment request at ${salonName} on ${formattedDate} has been cancelled.`;
          await notificationService.createNotification(
            appointment.user_id,
            "appointment",
            deniedMessage
          );

          // Notify salon owner
          if (salonInfo?.owner_id) {
            const ownerMessage = `You cancelled ${customerName}'s appointment on ${formattedDate}`;
            await notificationService.createNotification(
              salonInfo.owner_id,
              "appointment",
              ownerMessage
            );
          }
        }
      } catch (notificationError) {
        console.error(
          "Error creating status change notification:",
          notificationError
        );
      }
    }

    // Schedule new reminders if time changed
    if (
      timeChanged &&
      oldScheduledTime !== newScheduledTime &&
      updated.status !== "cancelled"
    ) {
      try {
        const notificationSettings =
          await salonService.getSalonNotificationSettings(appointment.salon_id);
        const appointmentDate = new Date(newScheduledTime);
        const reminderHours = notificationSettings.reminderHoursBefore || 24;
        const reminderTime = new Date(
          appointmentDate.getTime() - reminderHours * 60 * 60 * 1000
        );

        if (reminderTime > new Date()) {
          const [[salonInfo]] = await db.query(
            "SELECT name FROM salons WHERE salon_id = ?",
            [appointment.salon_id]
          );
          const reminderMessage = `Reminder: You have an appointment at ${getSalonName(
            salonInfo
          )} on ${appointmentDate.toLocaleString()}`;

          if (notificationSettings.emailReminders) {
            await notificationService.sendAppointmentReminder(
              appointment.user_id,
              reminderMessage,
              reminderTime
            );
          }

          if (notificationSettings.inAppReminders) {
            await notificationService.scheduleInAppReminder(
              appointment.user_id,
              reminderMessage,
              reminderTime
            );
          }
        }
      } catch (reminderError) {
        console.error("Error scheduling new reminders:", reminderError);
      }
    }

    res.json({ message: "Appointment updated successfully", updated });
  } catch (error) {
    if (error?.code === "INVALID_APPOINTMENT_STATUS") {
      return res.status(400).json({ error: error.message });
    }
    console.error("Error updating appointment:", error);
    const errorMessage = error?.message || "Failed to update appointment";
    res.status(500).json({
      error: errorMessage,
      ...(process.env.NODE_ENV === "development" && { details: error.stack }),
    });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // Get appointment details before cancelling
    const appointment = await appointmentService.getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Cancel scheduled reminders
    try {
      const [[salonInfo]] = await db.query(
        "SELECT name FROM salons WHERE salon_id = ?",
        [appointment.salon_id]
      );
      const salonName = getSalonName(salonInfo);
      await notificationService.cancelScheduledReminders(
        appointment.user_id,
        salonName
      );
    } catch (reminderError) {
      console.error("Error cancelling reminders:", reminderError);
    }

    const role = req.user?.role || req.user?.user_role;
    const userId = req.user?.user_id || req.user?.id;
    if (role === "staff" && appointment.salon_id !== req.user?.salon_id)
      return res.status(403).json({ error: "Forbidden: cross-salon access" });
    if (role === "customer" && appointment.user_id !== userId)
      return res
        .status(403)
        .json({ error: "You can only cancel your own appointments" });

    const affectedRows = await appointmentService.cancelAppointment(id);
    if (affectedRows === 0)
      return res.status(404).json({ error: "Appointment not found" });
    res.json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // Get appointment details before deleting
    const appointment = await appointmentService.getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Check permissions
    const role = req.user?.role || req.user?.user_role;
    const userId = req.user?.user_id || req.user?.id;

    // For owners, check if they own the salon
    if (role === "owner") {
      const [[salonInfo]] = await db.query(
        "SELECT owner_id FROM salons WHERE salon_id = ?",
        [appointment.salon_id]
      );
      if (salonInfo && salonInfo.owner_id !== userId) {
        return res
          .status(403)
          .json({ error: "Forbidden: You don't own this salon" });
      }
    }

    if (role === "staff" && appointment.salon_id !== req.user?.salon_id) {
      return res.status(403).json({ error: "Forbidden: cross-salon access" });
    }

    if (role === "customer" && appointment.user_id !== userId) {
      return res
        .status(403)
        .json({ error: "You can only delete your own appointments" });
    }

    // Cancel scheduled reminders before deleting
    try {
      const [[salonInfo]] = await db.query(
        "SELECT name FROM salons WHERE salon_id = ?",
        [appointment.salon_id]
      );
      const salonName = getSalonName(salonInfo);
      await notificationService.cancelScheduledReminders(
        appointment.user_id,
        salonName
      );
    } catch (reminderError) {
      console.error("Error cancelling reminders:", reminderError);
    }

    // Delete the appointment
    const affectedRows = await appointmentService.deleteAppointment(id);
    if (affectedRows === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ error: "Failed to delete appointment" });
  }
};

exports.getAppointmentsBySalon = async (req, res) => {
  try {
    await appointmentService.expireStalePendingAppointments();
    const role = req.user?.role || req.user?.user_role;
    const tokenSalonId = req.user?.salon_id;
    const salonId =
      role === "admin"
        ? req.params.salon_id || req.query.salon_id || tokenSalonId
        : tokenSalonId;
    if (!salonId)
      return res
        .status(400)
        .json({ error: "Salon ID missing or not associated with this user" });
    if (role === "staff" && tokenSalonId !== Number(salonId))
      return res.status(403).json({ error: "Forbidden: cross-salon access" });
    const { date, from, to } = req.query;
    const appointments = await appointmentService.getAppointmentsBySalon(
      salonId,
      date,
      from,
      to
    );
    res.status(200).json({ data: appointments });
  } catch (error) {
    console.error("Error fetching salon appointments:", error);
    res.status(500).json({ error: "Failed to fetch salon appointments" });
  }
};

// ======================= Today's SUMMARY =======================
exports.getSalonStats = async (req, res) => {
  try {
    await appointmentService.expireStalePendingAppointments();
    const salon_id = Number(req.query.salon_id);
    if (!salon_id)
      return res.status(400).json({ error: "Missing salon_id parameter" });

    const [rows] = await db.query(
      `
      SELECT
        COUNT(
          CASE
            WHEN DATE(a.scheduled_time) = CURDATE()
              AND a.status <> 'cancelled'
            THEN 1
          END
        ) AS todays_appointments,
        COUNT(
          CASE
            WHEN a.status = 'confirmed'
              AND DATE(a.scheduled_time) = CURDATE()
            THEN 1
          END
        ) AS confirmed,
        COUNT(
          CASE
            WHEN a.status = 'pending'
              AND DATE(a.scheduled_time) = CURDATE()
            THEN 1
          END
        ) AS pending,
        COALESCE(
          SUM(
            CASE
              WHEN DATE(a.scheduled_time) = CURDATE()
                AND a.status IN ('confirmed','completed')
              THEN a.price
              ELSE 0
            END
          ),
          0
        ) AS revenue_today
      FROM appointments a
      WHERE a.salon_id = ?
      `,
      [salon_id]
    );

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Error fetching salon stats:", err);
    res.status(500).json({ error: "Server error fetching salon stats" });
  }
};
