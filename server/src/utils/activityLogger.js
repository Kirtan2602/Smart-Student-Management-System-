import prisma from '../config/db.js';

// Koi pan important action (login, user create, vagere) activity_logs ma lakhe.
// Log ma error aave to main kaam na atke.
export const logActivity = async ({
  userId = null,
  action,
  entity,
  entityId = null,
  details = null,
  ipAddress = null,
}) => {
  try {
    await prisma.activityLog.create({
      data: { userId, action, entity, entityId, details, ipAddress },
    });
  } catch (error) {
    console.error('Activity log failed:', error.message);
  }
};