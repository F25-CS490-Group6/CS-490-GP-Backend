# Appointment Reminder System

## Overview
The appointment reminder system automatically sends email and in-app notifications to customers before their scheduled appointments.

## How It Works

### 1. Reminder Scheduling
When an appointment is created or rescheduled, reminders are automatically scheduled based on salon settings:
- **Default**: 24 hours before the appointment
- **Configurable**: Salon owners can adjust reminder timing in settings

### 2. Notification Queue
Reminders are stored in the `notification_queue` table with:
- `user_id`: Who to notify
- `message`: Reminder message (includes appointment details)
- `delivery_method`: 'email' or 'in-app'
- `scheduled_for`: When to send the reminder
- `sent`: FALSE until processed

### 3. Automatic Processing
A cron job runs **every minute** to:
1. Check for reminders that are due (`scheduled_for <= NOW()`)
2. Send emails or create in-app notifications
3. Mark reminders as sent

## Features

### ✅ Email Reminders
- Sent to customer's registered email
- Includes appointment date, time, and salon name
- Professional HTML formatting
- Automatically sent 24 hours before (configurable)

### ✅ In-App Notifications
- Creates notification in user's notification center
- Visible when customer logs in
- Real-time notification badge

### ✅ Automatic Rescheduling
- If appointment time changes, old reminders are cancelled
- New reminders are automatically scheduled for the new time

### ✅ Duplicate Prevention
- Each reminder is marked as sent after processing
- No duplicate reminders for the same appointment

## Salon Owner Configuration

Salon owners can configure reminder settings:

```javascript
{
  emailReminders: true,        // Enable/disable email reminders
  inAppReminders: true,        // Enable/disable in-app notifications
  reminderHoursBefore: 24     // Hours before appointment to send reminder
}
```

## API Endpoints

### Manual Queue Processing (Testing)
```http
POST /api/notifications/process-queue
Authorization: Bearer <token>

Response:
{
  "message": "Queue processed successfully",
  "processed_count": 5
}
```

### Schedule Custom Reminder
```http
POST /api/notifications/reminder
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": 123,
  "message": "Custom reminder message",
  "scheduled_for": "2025-12-13T10:00:00Z"
}
```

## Database Tables

### notification_queue
Stores scheduled reminders:
```sql
CREATE TABLE notification_queue (
  queue_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  delivery_method ENUM('email', 'sms', 'push', 'in-app') DEFAULT 'email',
  scheduled_for DATETIME NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### notifications
Stores in-app notifications:
```sql
CREATE TABLE notifications (
  notification_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing the Reminder System

### Test 1: Create Appointment for Tomorrow
1. Create an appointment for 24 hours from now
2. Check `notification_queue` table - should have 1 entry with `sent = FALSE`
3. Wait until reminder time OR manually trigger processing
4. Check that email was sent and `sent = TRUE`

### Test 2: Manual Trigger
```bash
# Create a test reminder for immediate processing
curl -X POST http://localhost:4000/api/notifications/reminder \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "message": "Test reminder",
    "scheduled_for": "2025-12-12T10:00:00Z"
  }'

# Manually process the queue
curl -X POST http://localhost:4000/api/notifications/process-queue \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 3: Check Logs
The server logs show reminder processing:
```
[Scheduler] Notification reminder scheduler started (runs every minute)
[Reminder] Sent email reminder to customer@example.com for queue_id 123
[Scheduler] Processed 3 reminder(s)
```

## Troubleshooting

### Reminders Not Sending?
1. **Check cron is running**: Look for "Notification reminder scheduler started" in logs
2. **Check queue**: `SELECT * FROM notification_queue WHERE sent = FALSE;`
3. **Check email config**: Ensure `EMAIL_USER` and `EMAIL_PASS` are set in `.env`
4. **Manually trigger**: POST to `/api/notifications/process-queue`

### Duplicate Reminders?
- Check that old reminders are being cancelled when appointments are rescheduled
- Verify `sent = TRUE` after processing

### Reminder Time Wrong?
- Check salon's `reminderHoursBefore` setting
- Verify timezone settings in `scheduler/notificationScheduler.js`

## Future Enhancements

- [ ] SMS reminders via Twilio
- [ ] Multiple reminder times (24h, 1h before)
- [ ] Customer preference for reminder types
- [ ] Push notifications for mobile app
- [ ] Reminder delivery status tracking
- [ ] Retry logic for failed sends

## Production Deployment

The scheduler starts automatically when the server starts. Ensure:
1. ✅ `node-cron` is installed
2. ✅ Database has `notification_queue` table
3. ✅ Email credentials are configured
4. ✅ Server timezone is correct

No additional setup required!

