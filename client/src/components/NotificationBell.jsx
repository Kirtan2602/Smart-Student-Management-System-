import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notificationService';
import { NOTIFICATION_STYLE, NOTIFICATIONS_CHANGED } from '../utils/notification';
import { ROLE_HOME } from '../utils/roles';
import { timeAgo } from '../utils/format';

export default function NotificationBell() {
  const { user } = useAuth();
  const base = ROLE_HOME[user.role];

  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCount = useCallback(async () => {
    try {
      setUnread(await fetchUnreadCount());
    } catch {
      // bell ma error batavvani jarur nathi
    }
  }, []);

  // Darek 60 second e count refresh + notifications page ma kai badlay tyare
  useEffect(() => {
    loadCount();
    const timer = setInterval(loadCount, 60000);
    window.addEventListener(NOTIFICATIONS_CHANGED, loadCount);
    return () => {
      clearInterval(timer);
      window.removeEventListener(NOTIFICATIONS_CHANGED, loadCount);
    };
  }, [loadCount]);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (!next) return;

    setLoading(true);
    try {
      const res = await fetchNotifications({ limit: 5 });
      setItems(res.items);
      setUnread(res.unread);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const openItem = async (n) => {
    if (n.isRead) return;
    try {
      await markNotificationRead(n.id);
      setItems((list) => list.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      setUnread((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const readAll = async () => {
    try {
      await markAllNotificationsRead();
      setItems((list) => list.map((x) => ({ ...x, isRead: true })));
      setUnread(0);
    } catch {
      // ignore
    }
  };

  return (
    <div className="position-relative">
      <button
        className="btn btn-outline-secondary btn-sm position-relative"
        onClick={toggle}
        aria-label="Notifications"
        title="Notifications"
      >
        <i className="bi bi-bell" />
        {unread > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ zIndex: 1049 }}
            onClick={() => setOpen(false)}
          />
          <div
            className="card shadow position-fixed"
            style={{ zIndex: 1050, top: 66, right: 12, width: 'min(360px, calc(100vw - 24px))' }}
          >
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Notifications</span>
              {unread > 0 && (
                <button className="btn btn-link btn-sm p-0" onClick={readAll}>
                  Mark all read
                </button>
              )}
            </div>

            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {loading ? (
                <div className="p-3 text-center text-muted small">Loading...</div>
              ) : items.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <i className="bi bi-bell-slash fs-3 d-block mb-1" />
                  No notifications
                </div>
              ) : (
                items.map((n) => {
                  const style = NOTIFICATION_STYLE[n.type] || NOTIFICATION_STYLE.GENERAL;
                  return (
                    <div
                      key={n.id}
                      role="button"
                      className={`d-flex gap-2 p-3 border-bottom ${n.isRead ? '' : 'notif-unread'}`}
                      onClick={() => openItem(n)}
                    >
                      <i className={`bi ${style.icon} ${style.color} mt-1`} />
                      <div>
                        <div className={`small ${n.isRead ? '' : 'fw-semibold'}`}>{n.title}</div>
                        <div className="small text-muted">{n.message}</div>
                        <div className="small text-muted fst-italic">{timeAgo(n.createdAt)}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="card-footer bg-white text-center">
              <Link to={`${base}/notifications`} onClick={() => setOpen(false)}>
                View all notifications
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}