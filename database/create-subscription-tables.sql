-- =====================================================
-- CREATE SUBSCRIPTION PAYMENT AND SUBSCRIPTION TABLES
-- =====================================================

USE salon_platform;

-- Table to track subscription payments
CREATE TABLE IF NOT EXISTS subscription_payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan_name VARCHAR(50) NOT NULL,
  stripe_session_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255),
  amount INT NOT NULL, -- Amount in cents
  currency VARCHAR(10) DEFAULT 'usd',
  status VARCHAR(50) NOT NULL, -- 'paid', 'pending', 'failed', 'refunded'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_session (stripe_session_id),
  INDEX idx_subscription (stripe_subscription_id)
);

-- Table to track user subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  subscription_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  plan_name VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_status (status)
);

