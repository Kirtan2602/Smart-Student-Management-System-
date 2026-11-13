import { useCallback, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { fetchAttendanceSubjects } from '../../services/attendanceService';
import { fetchSubjectResults } from '../../services/resultService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import GradeBadge from '../../components/GradeBadge';
import ResultBadge from '../../components/ResultBadge';

export default function SubjectResults() {
  const subjectsFetch = useFetch(fetchAttendanceSubjects);
  const [subjectId, setSubjectId] = useState('');

  const fetcher = useCallback(
    () => (subjectId ? fetchSubjectResults({ subjectId }) : Promise.resolve(null)),
    [subjectId]
  );
  const { data, loading, error, reload } = useFetch(fetcher);

  const cell = (row, examId) => {
    const e = row.result?.exams.find((x) => x.examId === examId);
    return e && e.obtained !== null ? e.obtained : '-';
  };

  return (
    <>
      <PageHeader
        title="Subject Results"
        subtitle="Student-wise performance of a subject (published exams only)"
      />

      <div className="card mb-3">
        <div className="card-body">
          <label className="form-label small text-muted mb-1">Subject</label>
          <select className="form-select" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">Select subject</option>
            {(subjectsFetch.data || []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} · {s.name} ({s.department.code} - Sem {s.semester.number})
              </option>
            ))}
          </select>
        </div>
      </div>

      {!subjectId ? (
        <div className="card">
          <EmptyState icon="bi-table" message="Select a subject to view results" />
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : loading || !data ? (
        <Loader />
      ) : (
        <>
          <div className="row g-3 mb-3">
            {[
              ['Students', data.stats.students],
              ['Result Declared', data.stats.declared],
              ['Passed', data.stats.passCount],
              ['Failed', data.stats.failCount],
              ['Pass %', data.stats.passPercentage !== null ? `${data.stats.passPercentage}%` : '-'],
              ['Average %', data.stats.averagePercentage !== null ? `${data.stats.averagePercentage}%` : '-'],
            ].map(([label, value]) => (
              <div key={label} className="col-6 col-md-2">
                <div className="card">
                  <div className="card-body py-2 text-center">
                    <div className="text-muted small">{label}</div>
                    <div className="fs-5 fw-bold">{value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            {data.exams.length === 0 ? (
              <EmptyState
                icon="bi-megaphone"
                message="No published exams for this subject yet. Publish an exam to see results here."
              />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Enrollment No</th>
                      <th>Name</th>
                      {data.exams.map((e) => (
                        <th key={e.examId} className="text-center">
                          {e.name}
                          <div className="small text-muted fw-normal">/ {e.maxMarks}</div>
                        </th>
                      ))}
                      <th className="text-center">Total</th>
                      <th className="text-center">%</th>
                      <th className="text-center">Grade</th>
                      <th className="text-center">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((r) => (
                      <tr key={r.student.id}>
                        <td className="fw-semibold">{r.student.enrollmentNo}</td>
                        <td>
                          {r.student.firstName} {r.student.lastName}
                        </td>
                        {data.exams.map((e) => (
                          <td key={e.examId} className="text-center">
                            {cell(r, e.examId)}
                          </td>
                        ))}
                        <td className="text-center">
                          {r.result?.hasResult ? `${r.result.total} / ${r.result.max}` : '-'}
                        </td>
                        <td className="text-center">
                          {r.result?.percentage !== null && r.result?.percentage !== undefined
                            ? `${r.result.percentage}%`
                            : '-'}
                        </td>
                        <td className="text-center">
                          <GradeBadge grade={r.result?.grade} />
                        </td>
                        <td className="text-center">
                          <ResultBadge result={r.result?.result} />
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