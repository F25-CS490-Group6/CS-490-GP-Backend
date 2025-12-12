// scheduler/notificationScheduler.js
const cron = require('node-cron');
const notificationService = require('../modules/notifications/service');

/**
 * Start the notification queue processor
 * Runs every minute to check for and send due reminders
 */
function startNotificationScheduler() {
  // Run every minute: */1 * * * *
  // Format: second minute hour day month day-of-week
  const job = cron.schedule('* * * * *', async () => {
    try {
      const processed = await notificationService.processNotificationQueue();
      if (processed > 0) {
        console.log(`[Scheduler] Processed ${processed} reminder(s)`);
      }
    } catch (error) {
      console.error('[Scheduler] Error processing notification queue:', error);
    }
  }, {
    scheduled: true,
    timezone: "America/New_York" // Adjust to your timezone
  });

  console.log('[Scheduler] Notification reminder scheduler started (runs every minute)');
  
  return job;
}

module.exports = { startNotificationScheduler };

