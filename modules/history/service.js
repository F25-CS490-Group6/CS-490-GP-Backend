//history/service.js
const { db } = require("../../config/database");

exports.getUserHistory = async (user_id) => {
  const [rows] = await db.query(
    `SELECT 
      a.appointment_id,
      a.salon_id,
      a.staff_id,
      a.scheduled_time,
      a.status,
      a.price,
      a.created_at,
      s.full_name AS staff_name,
      GROUP_CONCAT(sv.custom_name SEPARATOR ', ') AS service_name,
      sl.name AS salon_name
     FROM appointments a
     LEFT JOIN staff st ON a.staff_id = st.staff_id
     LEFT JOIN users s ON st.user_id = s.user_id
     LEFT JOIN appointment_services aps ON a.appointment_id = aps.appointment_id
     LEFT JOIN services sv ON aps.service_id = sv.service_id
     LEFT JOIN salons sl ON a.salon_id = sl.salon_id
     WHERE a.user_id = ?
     GROUP BY a.appointment_id
     ORDER BY a.scheduled_time DESC`,
    [user_id]
  );
  return rows;
};

exports.getSalonVisitHistory = async (salon_id) => {
  const [rows] = await db.query(
    `SELECT h.*, u.full_name AS customer_name, s.full_name AS staff_name, sv.custom_name AS service_name
     FROM history h
     LEFT JOIN users u ON h.user_id = u.user_id
     LEFT JOIN staff st ON h.staff_id = st.staff_id
     LEFT JOIN users s ON st.user_id = s.user_id
     LEFT JOIN services sv ON h.service_id = sv.service_id
     WHERE h.salon_id = ?
     ORDER BY h.visit_date DESC`,
    [salon_id]
  );
  return rows;
};

/**
 * Convert appointment history to CSV format
 */
exports.convertToCSV = (appointments) => {
  if (!appointments || appointments.length === 0) {
    return 'No appointments found';
  }

  // CSV header
  const headers = ['Appointment ID', 'Salon Name', 'Staff Name', 'Service Name', 'Scheduled Time', 'Status', 'Price', 'Created At'];
  const csvRows = [headers.join(',')];

  // CSV rows
  appointments.forEach(appointment => {
    const row = [
      appointment.appointment_id || '',
      `"${(appointment.salon_name || '').replace(/"/g, '""')}"`,
      `"${(appointment.staff_name || '').replace(/"/g, '""')}"`,
      `"${(appointment.service_name || '').replace(/"/g, '""')}"`,
      appointment.scheduled_time ? new Date(appointment.scheduled_time).toISOString() : '',
      appointment.status || '',
      appointment.price || '0',
      appointment.created_at ? new Date(appointment.created_at).toISOString() : ''
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
};
