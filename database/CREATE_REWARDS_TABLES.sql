-- Create rewards and promo code tables for RDS
-- Run this on EC2 or via AWS console

-- 1. Create salon_rewards table (if not exists)
CREATE TABLE IF NOT EXISTS salon_rewards (
  reward_id INT PRIMARY KEY AUTO_INCREMENT,
  salon_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  points_required INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (salon_id) REFERENCES salons(salon_id) ON DELETE CASCADE,
  INDEX idx_salon_rewards (salon_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Create user_rewards table (track redeemed rewards)
CREATE TABLE IF NOT EXISTS user_rewards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  salon_id INT NOT NULL,
  reward_id INT NOT NULL,
  redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active', 'used', 'expired') DEFAULT 'active',
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (salon_id) REFERENCES salons(salon_id) ON DELETE CASCADE,
  FOREIGN KEY (reward_id) REFERENCES salon_rewards(reward_id) ON DELETE CASCADE,
  INDEX idx_user_rewards (user_id, salon_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Create promo_codes table (if not exists)
CREATE TABLE IF NOT EXISTS promo_codes (
  promo_id INT PRIMARY KEY AUTO_INCREMENT,
  salon_id INT NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type ENUM('percentage', 'fixed') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  usage_limit INT DEFAULT 0 COMMENT '0 = unlimited',
  used_count INT DEFAULT 0,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (salon_id) REFERENCES salons(salon_id) ON DELETE CASCADE,
  INDEX idx_promo_salon (salon_id, is_active),
  INDEX idx_promo_code (code, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Create promo_code_usage table (track who used which codes)
CREATE TABLE IF NOT EXISTS promo_code_usage (
  usage_id INT PRIMARY KEY AUTO_INCREMENT,
  promo_id INT NOT NULL,
  user_id INT NOT NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  order_amount DECIMAL(10,2),
  discount_amount DECIMAL(10,2),
  FOREIGN KEY (promo_id) REFERENCES promo_codes(promo_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_promo_usage (promo_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Verify tables were created
SELECT 'Tables created successfully!' AS status;
SHOW TABLES LIKE '%reward%';
SHOW TABLES LIKE '%promo%';

