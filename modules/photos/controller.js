//photos/controller.js
const photoService = require("./service");

exports.addServicePhoto = async (req, res) => {
  try {
    const { appointment_id, staff_id, service_id, photo_type, photo_url } = req.body;
    const user_id = req.user.user_id || req.user.id;

    const photo_id = await photoService.addServicePhoto(appointment_id, user_id, staff_id, service_id, photo_type, photo_url);
    res.json({ message: "Photo uploaded", photo_id });
  } catch (err) {
    console.error("Photo error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getServicePhotos = async (req, res) => {
  try {
    const appointment_id = req.params.appointment_id;
    const photos = await photoService.getServicePhotos(appointment_id);
    res.json({ photos });
  } catch (err) {
    console.error("Get photos error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all photos for a salon
exports.getSalonGallery = async (req, res) => {
  try {
    const salon_id = req.params.salon_id;
    const photos = await photoService.getSalonGallery(salon_id);
    res.json(photos);
  } catch (err) {
    console.error("Get salon gallery error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Add a new photo to salon gallery
exports.addSalonPhoto = async (req, res) => {
  try {
    const { salon_id, caption } = req.body;
    const userId = req.user?.user_id || req.user?.id;
    
    if (!salon_id) {
      return res.status(400).json({ error: "Salon ID required" });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: "Photo file required" });
    }

    // Verify ownership
    const { db } = require("../../config/database");
    const [salonRows] = await db.query(
      "SELECT owner_id FROM salons WHERE salon_id = ?",
      [salon_id]
    );

    if (!salonRows || salonRows.length === 0) {
      return res.status(404).json({ error: "Salon not found" });
    }

    if (salonRows[0].owner_id !== userId && req.user?.user_role !== 'admin') {
      return res.status(403).json({ error: "Not authorized to add photos to this salon" });
    }

    const photo_url = `/uploads/${req.file.filename}`;
    
    const photo_id = await photoService.addSalonPhoto(salon_id, photo_url, caption);
    res.json({ message: "Photo added to gallery", photo_id, photo_url });
  } catch (err) {
    console.error("Add salon photo error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete a photo from gallery
exports.deleteSalonPhoto = async (req, res) => {
  try {
    const photo_id = req.params.photo_id;
    const userId = req.user?.user_id || req.user?.id;

    // Verify ownership through salon
    const { db } = require("../../config/database");
    const [photoRows] = await db.query(
      `SELECT sp.salon_id, s.owner_id 
       FROM salon_photos sp
       JOIN salons s ON sp.salon_id = s.salon_id
       WHERE sp.photo_id = ?`,
      [photo_id]
    );

    if (!photoRows || photoRows.length === 0) {
      return res.status(404).json({ error: "Photo not found" });
    }

    if (photoRows[0].owner_id !== userId && req.user?.user_role !== 'admin') {
      return res.status(403).json({ error: "Not authorized to delete this photo" });
    }

    await photoService.deleteSalonPhoto(photo_id);
    res.json({ message: "Photo deleted" });
  } catch (err) {
    console.error("Delete salon photo error:", err);
    res.status(500).json({ error: err.message });
  }
};

