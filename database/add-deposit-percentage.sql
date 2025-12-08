-- Add deposit_percentage column to salon_settings table
-- This allows salons to set a deposit percentage for "pay in store" appointments

ALTER TABLE salon_settings
ADD COLUMN IF NOT EXISTS deposit_percentage DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Deposit percentage required for pay-in-store appointments (0-100)';

