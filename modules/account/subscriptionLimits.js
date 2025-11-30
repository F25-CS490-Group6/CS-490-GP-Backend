const { db } = require("../../config/database");
const accountService = require("./service");

/**
 * Get subscription limits for a user
 */
function getSubscriptionLimits(planId) {
  const limits = {
    free: {
      maxStaff: 2,
      maxAppointmentsPerMonth: 50,
      hasLoyaltyProgram: false,
      hasAdvancedAnalytics: false,
      hasSMSNotifications: false,
      hasCustomBranding: false,
      hasAPIAccess: false,
    },
    premium: {
      maxStaff: 10,
      maxAppointmentsPerMonth: null, // unlimited
      hasLoyaltyProgram: true,
      hasAdvancedAnalytics: true,
      hasSMSNotifications: true,
      hasCustomBranding: true,
      hasAPIAccess: false,
    },
    enterprise: {
      maxStaff: null, // unlimited
      maxAppointmentsPerMonth: null, // unlimited
      hasLoyaltyProgram: true,
      hasAdvancedAnalytics: true,
      hasSMSNotifications: true,
      hasCustomBranding: true,
      hasAPIAccess: true,
    },
  };

  return limits[planId] || limits.free;
}

/**
 * Get user's subscription plan
 */
async function getUserSubscription(userId) {
  const subscription = await accountService.getCurrentSubscription(userId);
  return subscription.plan || "free";
}

/**
 * Check if user can add more staff
 */
async function canAddStaff(userId, salonId) {
  const plan = await getUserSubscription(userId);
  const limits = getSubscriptionLimits(plan);

  if (limits.maxStaff === null) {
    return { allowed: true };
  }

  // Count current active staff for this salon
  const [rows] = await db.query(
    `SELECT COUNT(*) as count 
     FROM staff 
     WHERE salon_id = ? AND is_active = 1`,
    [salonId]
  );

  const currentStaffCount = rows[0]?.count || 0;

  if (currentStaffCount >= limits.maxStaff) {
    return {
      allowed: false,
      message: `Your ${plan} plan allows up to ${limits.maxStaff} staff members. Please upgrade to add more.`,
      current: currentStaffCount,
      limit: limits.maxStaff,
    };
  }

  return { allowed: true, current: currentStaffCount, limit: limits.maxStaff };
}

/**
 * Check if user can create more appointments this month
 */
async function canCreateAppointment(userId, salonId) {
  const plan = await getUserSubscription(userId);
  const limits = getSubscriptionLimits(plan);

  if (limits.maxAppointmentsPerMonth === null) {
    return { allowed: true };
  }

  // Count appointments for current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [rows] = await db.query(
    `SELECT COUNT(*) as count 
     FROM appointments 
     WHERE salon_id = ? 
     AND scheduled_time >= ? 
     AND scheduled_time <= ? 
     AND status != 'cancelled'`,
    [salonId, startOfMonth, endOfMonth]
  );

  const currentAppointments = rows[0]?.count || 0;

  if (currentAppointments >= limits.maxAppointmentsPerMonth) {
    return {
      allowed: false,
      message: `Your ${plan} plan allows up to ${limits.maxAppointmentsPerMonth} appointments per month. Please upgrade to add more.`,
      current: currentAppointments,
      limit: limits.maxAppointmentsPerMonth,
    };
  }

  return {
    allowed: true,
    current: currentAppointments,
    limit: limits.maxAppointmentsPerMonth,
  };
}

/**
 * Check if feature is available for user's plan
 */
async function hasFeature(userId, feature) {
  const plan = await getUserSubscription(userId);
  const limits = getSubscriptionLimits(plan);
  return limits[feature] === true;
}

module.exports = {
  getSubscriptionLimits,
  getUserSubscription,
  canAddStaff,
  canCreateAppointment,
  hasFeature,
};

