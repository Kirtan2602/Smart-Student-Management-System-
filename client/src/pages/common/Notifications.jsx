import { useCallback, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import {
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/notificationService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { NOTIFICATION_STYLE, notifyChanged } from '../../utils/notification';
import { getErrorMessage } from '../../utils/errors';
import { formatDateTime, timeAgo } from '../../utils/format';

export default function Notifications() {
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  const fetcher = useCallback(
    () => fetchNotifications({ page, limit: 10, unreadOnly: filter === 'unread' ? 'true' : '' }),
    [page, filter]
  );
  const { data, loading, error, reload } = useFetch(fetcher);

  const run = async (action, successMessage) => {
    try {
      await action();
      if (successMessage) toast.success(successMessage);
      notifyChanged();
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const changeFilter = (value) => {
    setFilter(value);
    setPage(1);
  };

  return (
    <>
      <PageHeader title="Notifications" subtitle={data ? `${data.unread} unread` : ''}>
        <button
          className="btn btn-outline-primary"
          disabled={!data || data.unread === 0}
          onClick={() => run(markAllNotificationsRead, 'All notifications marked as read')}
        >
          <i className="bi bi-check2-all me-1" />
          Mark all read
        </button>
      </PageHeader>

      <div className="btn-group mb-3">
        <button
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => changeFilter('all')}
        >
          All
        </button>
        <button
          className={`btn ${filter === 'unread' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => changeFilter('unread')}
        >
          Unread
        </button>
      </div>

      <div className="card">
        {error ? (
          <div className="p-3">
            <ErrorMessage message={error} onRetry={reload} />
          </div>
        ) : loading && !data ? (
          <Loader />
        ) : data.items.length === 0 ? (
          <EmptyState
            icon="bi-bell-slash"
            message={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          />
        ) : (
          <>
            <div className={loading ? 'opacity-50' : ''}>
              {data.items.map((n) => {
                const style = NOTIFICATION_STYLE[n.type] || NOTIFICATION_STYLE.GENERAL;
                return (
                  <div
                    key={n.id}
                    className={`d-flex gap-3 p-3 border-bottom align-items-start ${n.isRead ? '' : 'notif-unread'}`}
                  >
                    <i className={`bi ${style.icon} ${style.color} fs-5`} />
                    <div className="flex-grow-1">
                      <div className={n.isRead ? '' : 'fw-semibold'}>{n.title}</div>
                      <div className="text-muted small">{n.message}</div>
                      <div className="text-muted small fst-italic" title={formatDateTime(n.createdAt)}>
                        {timeAgo(n.createdAt)}
                      </div>
                    </div>
                    <div className="text-nowrap">
                      {!n.isRead && (
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          title="Mark as read"
                          onClick={() => run(() => markNotificationRead(n.id))}
                        >
                          <i className="bi bi-check2" />
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        title="Delete"
                        onClick={() => run(() => deleteNotification(n.id), 'Notification deleted')}
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <Pagination meta={data.meta} onPageChange={setPage} />
          </>
        )}
      </div>
    </>
  );
}