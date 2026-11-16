import { useCallback, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useDebounce from '../../hooks/useDebounce';
import { fetchStudents } from '../../services/studentService';
import { downloadFile, fetchStudentReport } from '../../services/reportService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StudentPerformance from '../../components/StudentPerformance';

export default function StudentReport() {
  const [search, setSearch] = useState('');
  const [studentId, setStudentId] = useState('');
  const [showList, setShowList] = useState(false);
  const debounced = useDebounce(search.trim());

  const searchFetcher = useCallback(
    () => (debounced.length >= 2 ? fetchStudents({ search: debounced, limit: 8 }) : Promise.resolve(null)),
    [debounced]
  );
  const matches = useFetch(searchFetcher);

  const reportFetcher = useCallback(
    () => (studentId ? fetchStudentReport(studentId) : Promise.resolve(null)),
    [studentId]
  );
  const report = useFetch(reportFetcher);

  const pick = (s) => {
    setStudentId(String(s.id));
    setSearch(`${s.enrollmentNo} · ${s.firstName} ${s.lastName}`);
    setShowList(false);
  };

  return (
    <>
      <PageHeader title="Student Report" subtitle="Attendance and marks analytics of one student" />

      <div className="card mb-3">
        <div className="card-body">
          <label className="form-label small text-muted mb-1">Search student (name or enrollment no)</label>
          <input
            className="form-control"
            placeholder="Type at least 2 letters..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowList(true);
            }}
          />
          {showList && debounced.length >= 2 && (
            <div className="list-group mt-2">
              {matches.loading || !matches.data ? (
                <div className="list-group-item text-muted small">Searching...</div>
              ) : matches.data.items.length === 0 ? (
                <div className="list-group-item text-muted small">No student found</div>
              ) : (
                matches.data.items.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="list-group-item list-group-item-action"
                    onClick={() => pick(s)}
                  >
                    <span className="fw-semibold">{s.enrollmentNo}</span> · {s.firstName} {s.lastName}
                    <span className="text-muted small"> ({s.department.code} - Sem {s.semester.number})</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {!studentId ? (
        <div className="card">
          <EmptyState icon="bi-person-lines-fill" message="Search and select a student to view the report" />
        </div>
      ) : report.error ? (
        <ErrorMessage message={report.error} onRetry={report.reload} />
      ) : report.loading || !report.data ? (
        <Loader />
      ) : (
        <StudentPerformance
          report={report.data}
          onDownload={(format) =>
            downloadFile(
              `/reports/student/${studentId}/export`,
              { format },
              `student-report-${report.data.student.enrollmentNo}.${format}`
            )
          }
        />
      )}
    </>
  );
}