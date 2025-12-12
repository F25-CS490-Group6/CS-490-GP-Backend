//photos/controller.js
const photoService = require("./service");

exports.addServicePhoto = async (req, res) => {
  try {
    const { appointment_id, user_id: customer_user_id, salon_id, staff_id, service_id, photo_type, visit_date } = req.body;
    const requesting_user_id = req.user.user_id || req.user.id;
    const user_role = req.user.user_role;
    const { db } = require("../../config/database");
    
    // visit_date is optional - used for tracking when the service/visit happened
    // If not provided, we'll use the current date (stored in created_at)

    // Determine the customer user_id
    // If customer_user_id is provided (for staff adding to customer profile), use it
    // Otherwise, use the requesting user's ID (for customers uploading their own photos)
    let target_user_id = customer_user_id || requesting_user_id;
    let target_salon_id = salon_id;

    // If appointment_id is provided, get user_id and salon_id from appointment
    if (appointment_id) {
      const [appointmentRows] = await db.query(
        `SELECT user_id, salon_id FROM appointments WHERE appointment_id = ?`,
        [appointment_id]
      );
      if (appointmentRows.length > 0) {
        // Use the customer's user_id from the appointment (not the staff member's)
        target_user_id = appointmentRows[0].user_id;
        target_salon_id = appointmentRows[0].salon_id;
      } else {
        return res.status(404).json({ error: "Appointment not found" });
      }
    }

    // If no appointment_id, salon_id is required (for customer profile photos)
    if (!appointment_id && !target_salon_id) {
      return res.status(400).json({ error: "Either appointment_id or salon_id is required" });
    }

    // If appointment_id is not provided, user_id (customer) is required
    if (!appointment_id && !target_user_id) {
      return res.status(400).json({ error: "Either appointment_id or user_id is required" });
    }

    if (!photo_type) {
      return res.status(400).json({ error: "photo_type is required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Photo file required" });
    }

    // Validate photo_type
    if (!['before', 'after'].includes(photo_type)) {
      return res.status(400).json({ error: "photo_type must be 'before' or 'after'" });
    }

    // Authorization check: If adding to a customer profile (not own), verify staff/owner/admin
    if (target_user_id !== requesting_user_id) {
      // Check both user_role and role fields
      const role = user_role || req.user.role;
      
      if (!['admin', 'staff', 'owner'].includes(role)) {
        return res.status(403).json({ error: "Not authorized to add photos to this customer" });
      }
      
      // For staff, verify they belong to the same salon as the customer
      if (role === 'staff') {
        const staffId = req.user.staff_id || staff_id;
        if (!staffId) {
          return res.status(403).json({ error: "Staff ID not found" });
        }
        
        const [staffSalon] = await db.query(
          `SELECT salon_id FROM staff WHERE staff_id = ? AND is_active = 1`,
          [staffId]
        );
        
        if (staffSalon.length === 0) {
          return res.status(403).json({ error: "Staff not found" });
        }
        
        const staffSalonId = staffSalon[0].salon_id;
        
        // Verify the customer belongs to the same salon as the staff member
        const [customerSalon] = await db.query(
          `SELECT salon_id FROM salon_customers WHERE user_id = ? AND salon_id = ? LIMIT 1`,
          [target_user_id, staffSalonId]
        );
        
        if (customerSalon.length === 0) {
          return res.status(403).json({ error: "Not authorized to add photos to this customer" });
        }
        
        // Use staff's salon_id
        if (!target_salon_id) {
          target_salon_id = staffSalonId;
        } else if (parseInt(target_salon_id) !== parseInt(staffSalonId)) {
          return res.status(403).json({ error: "Not authorized to add photos for this salon" });
        }
      } else if (role === 'owner') {
        // For owners, verify the customer belongs to one of their salons
        if (target_salon_id) {
          const [salonRows] = await db.query(
            `SELECT owner_id FROM salons WHERE salon_id = ?`,
            [target_salon_id]
          );
          if (salonRows.length === 0 || salonRows[0].owner_id !== requesting_user_id) {
            return res.status(403).json({ error: "Not authorized to add photos for this salon" });
          }
          
          // Verify customer belongs to this salon
          const [customerSalon] = await db.query(
            `SELECT salon_id FROM salon_customers WHERE user_id = ? AND salon_id = ? LIMIT 1`,
            [target_user_id, target_salon_id]
          );
          
          if (customerSalon.length === 0) {
            return res.status(403).json({ error: "Not authorized to add photos to this customer" });
          }
        } else {
          // If no salon_id provided, find a salon owned by the owner that the customer belongs to
          const [ownerSalons] = await db.query(
            `SELECT s.salon_id FROM salons s
             INNER JOIN salon_customers sc ON sc.salon_id = s.salon_id
             WHERE s.owner_id = ? AND sc.user_id = ?
             LIMIT 1`,
            [requesting_user_id, target_user_id]
          );
          
          if (ownerSalons.length === 0) {
            return res.status(403).json({ error: "Not authorized to add photos to this customer" });
          }
          
          target_salon_id = ownerSalons[0].salon_id;
        }
      }
    } else {
      // Customer uploading their own photo - get salon_id from their salon_customers relationship
      if (!target_salon_id && !appointment_id) {
        const [customerSalon] = await db.query(
          `SELECT salon_id FROM salon_customers WHERE user_id = ? LIMIT 1`,
          [target_user_id]
        );
        if (customerSalon.length > 0) {
          target_salon_id = customerSalon[0].salon_id;
        }
      }
    }

    // S3 uploads have a 'location' property with full URL
    // Local uploads have a 'filename' property
    const photo_url = req.file.location || `/uploads/${req.file.filename}`;

    const photo_id = await photoService.addServicePhoto(
      appointment_id || null, 
      target_user_id, 
      target_salon_id || null,
      staff_id || req.user.staff_id || null, 
      service_id || null, 
      photo_type, 
      photo_url
    );
    
    res.json({ message: "Photo uploaded", photo_id, photo_url });
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

// Get all photos for a user (customer's transformation gallery)
// Optional query param: salon_id to filter by specific salon
exports.getUserPhotos = async (req, res) => {
  try {
    const user_id = parseInt(req.params.user_id) || req.user.user_id || req.user.id;
    const salon_id = req.query.salon_id ? parseInt(req.query.salon_id) : null;
    
    // Ensure user can only view their own photos (unless admin/staff/owner)
    const requesting_user_id = req.user.user_id || req.user.id;
    const user_role = req.user.user_role || req.user.role;
    const { db } = require("../../config/database");
    
    // Convert to numbers for proper comparison
    const userIdNum = parseInt(user_id);
    const requestingUserIdNum = parseInt(requesting_user_id);
    
    // If viewing someone else's photos, check authorization
    if (userIdNum !== requestingUserIdNum) {
      // Admin can view any photos
      if (user_role === 'admin') {
        // Allow access
      }
      // Staff and owners can view photos of customers in their salon
      else if (['staff', 'owner'].includes(user_role)) {
        // Get the requesting user's salon_id
        let requestingSalonId = req.user.salon_id;
        
        // For staff, get salon_id from staff table
        if (user_role === 'staff' && !requestingSalonId) {
          const staffId = req.user.staff_id;
          if (staffId) {
            const [staffRows] = await db.query(
              `SELECT salon_id FROM staff WHERE staff_id = ? AND is_active = 1`,
              [staffId]
            );
            if (staffRows.length > 0) {
              requestingSalonId = staffRows[0].salon_id;
            }
          }
        }
        
        // For owners, get salon_id from salons table
        if (user_role === 'owner' && !requestingSalonId) {
          const [salonRows] = await db.query(
            `SELECT salon_id FROM salons WHERE owner_id = ? LIMIT 1`,
            [requesting_user_id]
          );
          if (salonRows.length > 0) {
            requestingSalonId = salonRows[0].salon_id;
          }
        }
        
        // Verify the customer belongs to the same salon
        if (requestingSalonId) {
          const [customerSalon] = await db.query(
            `SELECT salon_id FROM salon_customers WHERE user_id = ? AND salon_id = ? LIMIT 1`,
            [userIdNum, requestingSalonId]
          );
          
          if (customerSalon.length === 0) {
            return res.status(403).json({ error: "Not authorized to view these photos" });
          }
        } else {
          return res.status(403).json({ error: "Not authorized to view these photos" });
        }
      }
      // Regular customers can only view their own photos
      else {
        return res.status(403).json({ error: "Not authorized to view these photos" });
      }
    }

    const photos = await photoService.getUserPhotos(userIdNum || user_id, salon_id);
    res.json({ photos });
  } catch (err) {
    console.error("Get user photos error:", err);
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

    // S3 uploads have a 'location' property with full URL
    // Local uploads have a 'filename' property
    const photo_url = req.file.location || `/uploads/${req.file.filename}`;
    
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

// Delete a service photo (before/after)
exports.deleteServicePhoto = async (req, res) => {
  try {
    const photo_id = req.params.photo_id;
    const userId = req.user?.user_id || req.user?.id;
    const staffId = req.user?.staff_id;

    // Verify ownership - user who uploaded, staff member, or salon owner
    const { db } = require("../../config/database");
    const [photoRows] = await db.query(
      `SELECT sp.*, s.owner_id, st.user_id as staff_user_id
       FROM service_photos sp
       LEFT JOIN salons s ON sp.salon_id = s.salon_id
       LEFT JOIN staff st ON sp.staff_id = st.staff_id
       WHERE sp.photo_id = ?`,
      [photo_id]
    );

    if (!photoRows || photoRows.length === 0) {
      return res.status(404).json({ error: "Photo not found" });
    }

    const photo = photoRows[0];
    
    // Allow delete if: user owns the photo, staff uploaded it, salon owner, or admin
    const isOwner = photo.user_id === userId;
    const isStaffUploader = staffId && photo.staff_id === staffId;
    const isSalonOwner = photo.owner_id === userId;
    const isAdmin = req.user?.user_role === 'admin';

    if (!isOwner && !isStaffUploader && !isSalonOwner && !isAdmin) {
      return res.status(403).json({ error: "Not authorized to delete this photo" });
    }

    await photoService.deleteServicePhoto(photo_id);
    res.json({ message: "Photo deleted" });
  } catch (err) {
    console.error("Delete service photo error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Download photo proxy - avoids CORS issues for S3 images
exports.downloadPhoto = async (req, res) => {
  try {
    const { url, filename } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: "URL parameter required" });
    }

    // Fetch the image from S3 or wherever it's hosted
    const https = require("https");
    const http = require("http");
    
    const protocol = url.startsWith("https") ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        return res.status(response.statusCode).json({ error: "Failed to fetch image" });
      }
      
      // Set headers for download
      const contentType = response.headers["content-type"] || "image/jpeg";
      const downloadFilename = filename || "photo.jpg";
      
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${downloadFilename}"`);
      
      // Pipe the image data to the response
      response.pipe(res);
    }).on("error", (err) => {
      console.error("Download proxy error:", err);
      res.status(500).json({ error: "Failed to download image" });
    });
  } catch (err) {
    console.error("Download photo error:", err);
    res.status(500).json({ error: err.message });
  }
};

