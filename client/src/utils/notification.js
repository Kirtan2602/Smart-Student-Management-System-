export const NOTIFICATION_STYLE = {
  LOW_ATTENDANCE: { icon: 'bi-exclamation-triangle-fill', color: 'text-danger' },
  RESULT: { icon: 'bi-award-fill', color: 'text-success' },
  GENERAL: { icon: 'bi-info-circle-fill', color: 'text-primary' },
};

// Notifications page ma kai badlay to bell ne khabar pade etle
export const NOTIFICATIONS_CHANGED = 'ssms:notifications-changed';
export const notifyChanged = () => window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));