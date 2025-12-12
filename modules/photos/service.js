//photos/service.js
const { db } = require("../../config/database");

exports.addServicePhoto = async (appointment_id, user_id, salon_id, staff_id, service_id, photo_type, photo_url) => {
  const [result] = await db.query(
    `INSERT INTO service_photos (appointment_id, user_id, salon_id, staff_id, service_id, photo_type, photo_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      appointment_id || null,
      user_id,
      salon_id || null,
      staff_id || null,
      service_id || null,
      photo_type,
      photo_url,
    ]
  );
  return result.insertId;
};

exports.getServicePhotos = async (appointment_id) => {
  const [photos] = await db.query(
    `SELECT * FROM service_photos WHERE appointment_id = ? ORDER BY created_at ASC`,
    [appointment_id]
  );
  return photos;
};

// Get all photos for a specific user (customer)
// Optionally filter by salon_id to show photos from a specific salon visit
exports.getUserPhotos = async (user_id, salon_id = null) => {
  let query = `
    SELECT sp.*, a.scheduled_time, s.salon_name, s.salon_id as salon_id
    FROM service_photos sp
    LEFT JOIN appointments a ON sp.appointment_id = a.appointment_id
    LEFT JOIN salons s ON sp.salon_id = s.salon_id
    WHERE sp.user_id = ?
  `;
  const params = [user_id];
  
  if (salon_id) {
    query += ` AND sp.salon_id = ?`;
    params.push(salon_id);
  }
  
  query += ` ORDER BY sp.created_at DESC`;
  
  const [photos] = await db.query(query, params);
  return photos;
};

// Get all gallery photos for a salon
exports.getSalonGallery = async (salon_id) => {
  const [photos] = await db.query(
    `SELECT photo_id, salon_id, photo_url, caption, created_at as uploaded_at 
     FROM salon_photos 
     WHERE salon_id = ? 
     ORDER BY created_at DESC`,
    [salon_id]
  );
  return photos;
};

// Add a photo to salon gallery
exports.addSalonPhoto = async (salon_id, photo_url, caption) => {
  const [result] = await db.query(
    `INSERT INTO salon_photos (salon_id, photo_url, caption) VALUES (?, ?, ?)`,
    [salon_id, photo_url, caption || null]
  );
  return result.insertId;
};

// Delete a photo from gallery
exports.deleteSalonPhoto = async (photo_id) => {
  await db.query(`DELETE FROM salon_photos WHERE photo_id = ?`, [photo_id]);
};

exports.deleteServicePhoto = async (photo_id) => {
  await db.query(`DELETE FROM service_photos WHERE photo_id = ?`, [photo_id]);
};

