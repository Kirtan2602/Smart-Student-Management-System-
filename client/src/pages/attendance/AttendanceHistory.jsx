import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';
import { fetchAttendanceSubjects, fetchHistory, fetchSession } from '../../services/attendanceService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { ROLE_HOME } from '../../utils/roles';
import { formatDate } from '../../utils/format';

function SessionDetailModal({ id, onClose }) {
  const fetcher = useCallback(() => fetchSession(id), [id]);
  const { data, loading, error } = useFetch(fetcher);

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {data
                  ? `${data.subject.code} · ${formatDate(data.date)} · Lecture ${data.lectureNo}`
                  : 'Attendance Details'}
              </h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body p-0">
              {loading ? (
                <Loader />
              ) : error ? (
                <div className="p-3">
                  <ErrorMessage message={error} />
                </div>
              ) : (
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Enrollment No</th>
                      <th>Name</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.records.map((r) => (
                      <tr key={r.id}>
                        <td className="fw-semibold">{r.student.enrollmentNo}</td>
                        <td>
                          {r.student.firstName} {r.student.lastName}
                        </td>
                        <td>
                          <span className={`badge ${r.status === 'PRESENT' ? 'text-bg-success' : 'text-bg-danger'}`}>
                            {r.status === 'PRESENT' ? 'Present' : 'Absent'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}

export default function AttendanceHistory() {
  const { user } = useAuth();
  const base = ROLE_HOME[user.role];
  const subjectsFetch = useFetch(fetchAttendanceSubjects);

  const [subjectId, setSubjectId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [viewId, setViewId] = useState(null);

  const fetcher = useCallback(
    () => fetchHistory({ page, limit: 10, subjectId, from, to }),
    [page, subjectId, from, to]
  );
  const { data, loading, error, reload } = useFetch(fetcher);

  const onFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <>
      <PageHeader title="Attendance History" subtitle="All marked lectures" />

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-12 col-md-6">
              <label className="form-label small text-muted mb-1">Subject</label>
              <select className="form-select" value={subjectId} onChange={onFilter(setSubjectId)}>
                <option value="">All Subjects</option>
                {(subjectsFetch.data || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} · {s.name}
                  </option>
                ))}
              </select>
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
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="p-3">
            <ErrorMessage message={error} onRetry={reload} />
          </div>
        ) : data.items.length === 0 ? (
          <EmptyState icon="bi-clock-history" message="No attendance records found" />
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Lecture</th>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th className="text-center">Present</th>
                    <th className="text-center">Absent</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((s) => (
                    <tr key={s.id}>
                      <td>{formatDate(s.date)}</td>
                      <td>{s.lectureNo}</td>
                      <td>
                        <span className="fw-semibold">{s.subject.code}</span>
                        <div className="small text-muted">{s.subject.name}</div>
                      </td>
                      <td className="small">
                        {s.teacher.firstName} {s.teacher.lastName}
                      </td>
                      <td className="text-center">
                        <span className="badge text-bg-success">{s.present}</span>
                      </td>
                      <td className="text-center">
                        <span className="badge text-bg-danger">{s.absent}</span>
                      </td>
                      <td className="text-end text-nowrap">
                        <button className="btn btn-sm btn-outline-primary me-1" title="View" onClick={() => setViewId(s.id)}>
                          <i className="bi bi-eye" />
                        </button>
                        <Link
                          className="btn btn-sm btn-outline-secondary"
                          title="Edit"
                          to={`${base}/attendance/mark?subjectId=${s.subject.id}&date=${String(s.date).slice(0, 10)}&lectureNo=${s.lectureNo}`}
                        >
                          <i className="bi bi-pencil" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={data.meta} onPageChange={setPage} />
          </>
        )}
      </div>

      {viewId && <SessionDetailModal id={viewId} onClose={() => setViewId(null)} />}
    </>
  );
}