import { useCallback, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { fetchAttendanceSubjects, fetchReport } from '../../services/attendanceService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import PercentBadge from '../../components/PercentBadge';

export default function AttendanceReport() {
  const subjectsFetch = useFetch(fetchAttendanceSubjects);

  const [subjectId, setSubjectId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const fetcher = useCallback(
    () => (subjectId ? fetchReport({ subjectId, from, to }) : Promise.resolve(null)),
    [subjectId, from, to]
  );
  const { data, loading, error, reload } = useFetch(fetcher);

  return (
    <>
      <PageHeader title="Attendance Report" subtitle="Student-wise attendance percentage of a subject" />

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-12 col-md-6">
              <label className="form-label small text-muted mb-1">Subject</label>
              <select className="form-select" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                <option value="">Select subject</option>
                {(subjectsFetch.data || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} · {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small text-muted mb-1">From</label>
              <input type="date" className="form-control" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small text-muted mb-1">To</label>
              <input type="date" className="form-control" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {!subjectId ? (
        <div className="card">
          <EmptyState icon="bi-clipboard-data" message="Select a subject to view the report" />
        </div>
      ) : loading || (!data && !error) ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : (
        <>
          <div className="row g-3 mb-3">
            <div className="col-6 col-md-3">
              <div className="card">
                <div className="card-body">
                  <div className="text-muted small">Total Lectures</div>
                  <div className="fs-4 fw-bold">{data.totalSessions}</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card">
                <div className="card-body">
                  <div className="text-muted small">Students</div>
                  <div className="fs-4 fw-bold">{data.rows.length}</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card">
                <div className="card-body">
                  <div className="text-muted small">Minimum Required</div>
                  <div className="fs-4 fw-bold">{data.threshold}%</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card">
                <div className="card-body">
                  <div className="text-muted small">Below Minimum</div>
                  <div className={`fs-4 fw-bold ${data.lowCount > 0 ? 'text-danger' : 'text-success'}`}>
                    {data.lowCount}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {data.lowCount > 0 && (
            <div className="alert alert-warning">
              <i className="bi bi-exclamation-triangle-fill me-2" />
              {data.lowCount} student(s) have attendance below {data.threshold}%.
            </div>
          )}

          <div className="card">
            {data.rows.length === 0 ? (
              <EmptyState icon="bi-people" message="No students are enrolled in this subject" />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Enrollment No</th>
                      <th>Name</th>
                      <th className="text-center">Present</th>
                      <th className="text-center">Absent</th>
                      <th className="text-center">Total</th>
                      <th style={{ minWidth: 160 }}>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((r) => (
                      <tr key={r.id} className={r.isLow ? 'table-danger' : ''}>
                        <td className="fw-semibold">{r.enrollmentNo}</td>
                        <td>
                          {r.firstName} {r.lastName}
                          {r.isLow && (
                            <span className="badge text-bg-danger ms-2">
                              <i className="bi bi-exclamation-triangle me-1" />
                              Low
                            </span>
                          )}
                        </td>
                        <td className="text-center">{r.present}</td>
                        <td className="text-center">{r.absent}</td>
                        <td className="text-center">{r.total}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="progress flex-grow-1" style={{ height: 8 }}>
                              <div
                                className={`progress-bar ${r.isLow ? 'bg-danger' : 'bg-success'}`}
                                style={{ width: `${r.percentage ?? 0}%` }}
                              />
                            </div>
                            <PercentBadge value={r.percentage} isLow={r.isLow} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}