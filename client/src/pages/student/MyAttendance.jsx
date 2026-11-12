import { useCallback, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { fetchMyAttendance } from '../../services/attendanceService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import PercentBadge from '../../components/PercentBadge';
import { formatDate } from '../../utils/format';

export default function MyAttendance() {
  const [subjectId, setSubjectId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  const fetcher = useCallback(
    () => fetchMyAttendance({ page, limit: 10, subjectId, from, to }),
    [page, subjectId, from, to]
  );
  const { data, loading, error, reload } = useFetch(fetcher);

  // Pehli vaar j full-page loader; filter badlo tyare page jaay nahi
  if (loading && !data) return <Loader />;
  if (error && !data) return <ErrorMessage message={error} onRetry={reload} />;

  const { summary, history, meta } = data;
  const lowSubjects = summary.subjects.filter((s) => s.isLow);

  const onFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <>
      <PageHeader title="My Attendance" subtitle={`Academic Year ${summary.academicYear}`} />

      {error && <ErrorMessage message={error} onRetry={reload} />}

      {lowSubjects.length > 0 && (
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          Your attendance is below {summary.threshold}% in: {lowSubjects.map((s) => s.code).join(', ')}.
        </div>
      )}

      <div className="card mb-3">
        <div className="card-body d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <div className="text-muted small">Overall Attendance</div>
            <div className="fs-3 fw-bold">
              <PercentBadge value={summary.overall.percentage} isLow={summary.overall.isLow} />
            </div>
          </div>
          <div className="text-muted">
            {summary.overall.present} present out of {summary.overall.total} lectures
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {summary.subjects.length === 0 ? (
          <div className="col-12">
            <div className="card">
              <EmptyState icon="bi-book" message="You are not enrolled in any subject" />
            </div>
          </div>
        ) : (
          summary.subjects.map((s) => (
            <div key={s.subjectId} className="col-12 col-md-6 col-xl-4">
              <div className={`card h-100 ${s.isLow ? 'border-danger' : ''}`}>
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="fw-semibold">{s.code}</div>
                      <div className="small text-muted">{s.name}</div>
                    </div>
                    <PercentBadge value={s.percentage} isLow={s.isLow} />
                  </div>
                  <div className="progress my-3" style={{ height: 8 }}>
                    <div
                      className={`progress-bar ${s.isLow ? 'bg-danger' : 'bg-success'}`}
                      style={{ width: `${s.percentage ?? 0}%` }}
                    />
                  </div>
                  <div className="small text-muted">
                    Present {s.present} · Absent {s.absent} · Total {s.total}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <h5 className="fw-bold mb-2">Attendance History</h5>
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-12 col-md-6">
              <select className="form-select" value={subjectId} onChange={onFilter(setSubjectId)}>
                <option value="">All Subjects</option>
                {summary.subjects.map((s) => (
                  <option key={s.subjectId} value={s.subjectId}>
                    {s.code} · {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <input type="date" className="form-control" value={from} onChange={onFilter(setFrom)} />
            </div>
            <div className="col-6 col-md-3">
              <input type="date" className="form-control" value={to} onChange={onFilter(setTo)} />
            </div>
          </div>
        </div>
      </div>

      <div className={`card ${loading ? 'opacity-50' : ''}`}>
        {history.length === 0 ? (
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
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((r) => (
                    <tr key={r.id}>
                      <td>{formatDate(r.session.date)}</td>
                      <td>{r.session.lectureNo}</td>
                      <td>
                        <span className="fw-semibold">{r.session.subject.code}</span>
                        <span className="text-muted small"> · {r.session.subject.name}</span>
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
            </div>
            <Pagination meta={meta} onPageChange={setPage} />
          </>
        )}
      </div>
    </>
  );
}