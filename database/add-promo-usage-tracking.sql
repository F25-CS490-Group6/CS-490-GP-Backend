-- Track which users have used which promo codes (for single-use per customer)
CREATE TABLE IF NOT EXISTS promo_code_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  promo_id INT NOT NULL,
  user_id INT NOT NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_promo_user (promo_id, user_id),
  FOREIGN KEY (promo_id) REFERENCES promo_codes(promo_id) ON DELETE CASCADE
);

