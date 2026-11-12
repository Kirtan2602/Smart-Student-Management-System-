import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { fetchMyAttendance } from '../services/attendanceService';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import PercentBadge from './PercentBadge';

// Bahar define karyu chhe, jethi darek render par navo function na bane
const fetcher = () => fetchMyAttendance({ limit: 1 });

export default function AttendanceSummaryCard() {
  const { data, loading, error, reload } = useFetch(fetcher);

  return (
    <div className="card h-100">
      <div className="card-header bg-white fw-semibold">Attendance</div>
      <div className="card-body">
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} onRetry={reload} />
        ) : (
          <>
            <div className="text-muted small">Overall Attendance</div>
            <div className="fs-2 fw-bold mb-1">
              <PercentBadge
                value={data.summary.overall.percentage}
                isLow={data.summary.overall.isLow}
              />
            </div>
            <div className="small text-muted mb-3">
              {data.summary.overall.present} present out of {data.summary.overall.total} lectures
            </div>

            {data.summary.subjects.filter((s) => s.isLow).length > 0 && (
              <div className="alert alert-warning py-2 small">
                <i className="bi bi-exclamation-triangle-fill me-2" />
                Low attendance (below {data.summary.threshold}%):{' '}
                {data.summary.subjects.filter((s) => s.isLow).map((s) => s.code).join(', ')}
              </div>
            )}

            <Link to="/student/attendance" className="btn btn-sm btn-outline-primary">
              View full attendance
            </Link>
          </>
        )}
      </div>
    </div>
  );
}