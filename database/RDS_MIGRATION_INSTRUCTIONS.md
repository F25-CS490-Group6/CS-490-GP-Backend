# RDS Database Migration Instructions

## Loyalty System Database Changes

### Prerequisites
- Access to RDS instance
- MySQL client installed
- RDS credentials from `.env` file

### RDS Connection Details
```
Host: stygo-db.cpwmz026siew5.us-east-2.rds.amazonaws.com
Port: 3306
User: admin
Password: Master$05
Database: salon_platform
```

### Apply Migration

#### Option 1: Using MySQL Command Line
```bash
mysql -h stygo-db.cpwmz026siew5.us-east-2.rds.amazonaws.com \
      -P 3306 \
      -u admin \
      -p'Master$05' \
      salon_platform < database/APPLY_TO_RDS.sql
```

#### Option 2: Using MySQL Workbench
1. Connect to RDS instance
2. Open `database/APPLY_TO_RDS.sql`
3. Execute the script
4. Verify the changes

#### Option 3: Copy and Paste
1. Connect to RDS
2. Copy the contents of `database/APPLY_TO_RDS.sql`
3. Paste into MySQL console
4. Execute

### What This Migration Does

1. **Adds columns to `salon_settings` table:**
   - `loyalty_enabled` (BOOLEAN) - Whether loyalty program is active
   - `points_per_dollar` (DECIMAL) - Points earned per dollar (default: 1.00)
   - `points_per_visit` (INT) - Bonus points per visit (default: 10)
   - `redeem_rate` (DECIMAL) - Points per $1 discount (default: 100)
   - `min_points_redeem` (INT) - Minimum points to redeem (default: 100)

2. **Adds index:**
   - `idx_salon_loyalty` on `(salon_id, loyalty_enabled)` for faster queries

3. **Updates existing salons:**
   - Sets default loyalty settings for all existing salons

### Verification

After running the migration, verify with:

```sql
-- Check the new columns exist
DESCRIBE salon_settings;

-- Check loyalty settings for all salons
SELECT salon_id, loyalty_enabled, points_per_dollar, points_per_visit, 
       redeem_rate, min_points_redeem 
FROM salon_settings 
LIMIT 10;

-- Count salons with loyalty enabled
SELECT COUNT(*) as total_salons,
       SUM(loyalty_enabled) as loyalty_enabled_count
FROM salon_settings;
```

### Rollback (if needed)

To rollback the changes:

```sql
ALTER TABLE salon_settings 
  DROP COLUMN loyalty_enabled,
  DROP COLUMN points_per_dollar,
  DROP COLUMN points_per_visit,
  DROP COLUMN redeem_rate,
  DROP COLUMN min_points_redeem;

DROP INDEX idx_salon_loyalty ON salon_settings;
```

### Notes

- The migration script is **idempotent** - safe to run multiple times
- It checks if columns exist before adding them
- Default values are set for all existing salons
- No data loss occurs during migration

