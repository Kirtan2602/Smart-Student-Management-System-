import { useCallback, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { fetchAttendanceSubjects } from '../../services/attendanceService';
import { downloadFile, fetchSubjectReport } from '../../services/reportService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import ExportButtons from '../../components/ExportButtons';
import PercentBadge from '../../components/PercentBadge';
import GradeBadge from '../../components/GradeBadge';
import ResultBadge from '../../components/ResultBadge';
import BarChart from '../../components/charts/BarChart';

const BANDS = ['Below 50%', '50-64%', '65-74%', '75-89%', '90-100%'];
const bandOf = (p) => (p < 50 ? 0 : p < 65 ? 1 : p < 75 ? 2 : p < 90 ? 3 : 4);

export default function SubjectReport() {
  const subjectsFetch = useFetch(fetchAttendanceSubjects);
  const [subjectId, setSubjectId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const fetcher = useCallback(
    () => (subjectId ? fetchSubjectReport(subjectId, { from, to }) : Promise.resolve(null)),
    [subjectId, from, to]
  );
  const { data, loading, error, reload } = useFetch(fetcher);

  // Charts mate data (client par calculate)
  const attendanceBands = BANDS.map(() => 0);
  const gradeCounts = new Map();
  if (data) {
    data.rows.forEach((r) => {
      if (r.percentage !== null) attendanceBands[bandOf(r.percentage)] += 1;
    });
    [...data.rows]
      .filter((r) => r.grade)
      .sort((a, b) => b.marksPercentage - a.marksPercentage)
      .forEach((r) => gradeCounts.set(r.grade, (gradeCounts.get(r.grade) || 0) + 1));
  }

  return (
    <>
      <PageHeader title="Subject Report" subtitle="Attendance and marks of a subject, student-wise">
        {data && (
          <ExportButtons
            onDownload={(format) =>
              downloadFile(
                `/reports/subject/${subjectId}/export`,
                { format, from, to },
                `subject-report-${data.subject.code}.${format}`
              )
            }
          />
        )}
      </PageHeader>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-12 col-md-6">
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
            <div className="col-6 col-md-3">
              <label className="form-label small text-muted mb-1">Attendance from</label>
              <input type="date" className="form-control" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small text-muted mb-1">Attendance to</label>
              <input type="date" className="form-control" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {!subjectId ? (
        <div className="card">
          <EmptyState icon="bi-clipboard-data" message="Select a subject to view its report" />
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : loading || !data ? (
        <Loader />
      ) : (
        <>
          <div className="row g-3 mb-3">
            {[
              ['Students', data.rows.length],
              ['Lectures Held', data.totalSessions],
              [`Below ${data.threshold}%`, data.lowCount],
              ['Result Declared', data.resultStats.declared],
              ['Pass %', data.resultStats.passPercentage !== null ? `${data.resultStats.passPercentage}%` : 'N/A'],
              ['Avg Marks %', data.resultStats.averagePercentage !== null ? `${data.resultStats.averagePercentage}%` : 'N/A'],
            ].map(([labelText, value]) => (
              <div key={labelText} className="col-6 col-md-2">
                <div className="card">
                  <div className="card-body py-2 text-center">
                    <div className="text-muted small">{labelText}</div>
                    <div className="fs-5 fw-bold">{value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-header bg-white fw-semibold">Attendance Distribution (students)</div>
                <div className="card-body">
                  <BarChart labels={BANDS} datasets={[{ label: 'Students', data: attendanceBands, color: '#0e9f6e' }]} />
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-header bg-white fw-semibold">Grade Distribution (students)</div>
                <div className="card-body">
                  {gradeCounts.size === 0 ? (
                    <EmptyState icon="bi-megaphone" message="No published marks for this subject yet" />
                  ) : (
                    <BarChart labels={[...gradeCounts.keys()]} datasets={[{ label: 'Students', data: [...gradeCounts.values()] }]} />
                  )}
                </div>
              </div>
            </div>
          </div>

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
                      <th className="text-center">Present / Total</th>
                      <th className="text-center">Attendance</th>
                      <th className="text-center">Marks</th>
                      <th className="text-center">%</th>
                      <th className="text-center">Grade</th>
                      <th className="text-center">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((r) => (
                      <tr key={r.id} className={r.isLow ? 'table-danger' : ''}>
                        <td className="fw-semibold">{r.enrollmentNo}</td>
                        <td>
                          {r.firstName} {r.lastName}
                        </td>
                        <td className="text-center">
                          {r.present} / {r.total}
                        </td>
                        <td className="text-center">
                          <PercentBadge value={r.percentage} isLow={r.isLow} />
                        </td>
                        <td className="text-center">{r.marksTotal !== null ? `${r.marksTotal} / ${r.marksMax}` : '-'}</td>
                        <td className="text-center">{r.marksPercentage !== null ? `${r.marksPercentage}%` : '-'}</td>
                        <td className="text-center">
                          <GradeBadge grade={r.grade} />
                        </td>
                        <td className="text-center">
                          <ResultBadge result={r.result} />
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