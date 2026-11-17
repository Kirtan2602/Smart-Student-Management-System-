import { useCallback, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useDebounce from '../../hooks/useDebounce';
import { fetchActivityLogs } from '../../services/activityService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { formatDateTime } from '../../utils/format';

export default function ActivityLogs() {
  const [action, setAction] = useState('');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const fetcher = useCallback(
    () => fetchActivityLogs({ page, limit: 15, action, search: debouncedSearch, from, to }),
    [page, action, debouncedSearch, from, to]
  );
  const { data, loading, error, reload } = useFetch(fetcher);

  const onFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <>
      <PageHeader title="Activity Logs" subtitle="Who did what in the system" />

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-12 col-md-3">
              <label className="form-label small text-muted mb-1">Action</label>
              <select className="form-select" value={action} onChange={onFilter(setAction)}>
                <option value="">All actions</option>
                {(data?.actions || []).map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label small text-muted mb-1">Search</label>
              <input
                className="form-control"
                placeholder="User email or details..."
                value={search}
                onChange={onFilter(setSearch)}
              />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small text-muted mb-1">From</label>
              <input type="date" className="form-control" value={from} onChange={onFilter(setFrom)} />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small text-muted mb-1">To</label>
              <input type="date" className="form-control" value={to} onChange={onFilter(setTo)} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        {error ? (
          <div className="p-3">
            <ErrorMessage message={error} onRetry={reload} />
          </div>
        ) : loading && !data ? (
          <Loader />
        ) : data.items.length === 0 ? (
          <EmptyState icon="bi-activity" message="No activity found" />
        ) : (
          <>
            <div className={`table-responsive ${loading ? 'opacity-50' : ''}`}>
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Details</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((log) => (
                    <tr key={log.id}>
                      <td className="small text-nowrap">{formatDateTime(log.createdAt)}</td>
                      <td className="small">
                        {log.user?.email || '-'}
                        {log.user && <div className="text-muted">{log.user.role}</div>}
                      </td>
                      <td>
                        <span className="badge text-bg-secondary">{log.action}</span>
                      </td>
                      <td className="small">{log.entity}</td>
                      <td className="small">{log.details || '-'}</td>
                      <td className="small text-muted">{log.ipAddress || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={data.meta} onPageChange={setPage} />
          </>
        )}
      </div>
    </>
  );
}