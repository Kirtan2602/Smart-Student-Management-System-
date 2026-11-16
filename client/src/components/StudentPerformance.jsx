import BarChart from './charts/BarChart';
import ExportButtons from './ExportButtons';
import EmptyState from './EmptyState';
import PercentBadge from './PercentBadge';
import GradeBadge from './GradeBadge';
import ResultBadge from './ResultBadge';

export default function StudentPerformance({ report, onDownload }) {
  const { student, academicYear, threshold, attendance, semesters, subjects, exams, insights } = report;
  const labels = subjects.map((s) => s.code);

  return (
    <>
      <div className="card mb-3">
        <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <div className="fs-5 fw-bold">
              {student.firstName} {student.lastName}
            </div>
            <div className="text-muted small">
              {student.enrollmentNo} · {student.department.name} · {student.semester.name} · Academic Year {academicYear}
            </div>
          </div>
          <ExportButtons onDownload={onDownload} />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-muted small">Overall Attendance (min {threshold}%)</div>
              <div className="fs-3 fw-bold">
                <PercentBadge value={attendance.percentage} isLow={attendance.isLow} />
              </div>
              <div className="small text-muted">
                {attendance.present} present out of {attendance.total} lectures
              </div>
            </div>
          </div>
        </div>
        {semesters.map((g) => (
          <div key={g.semester.number} className="col-12 col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <div className="text-muted small">{g.semester.name} Result</div>
                <div className="fs-4">
                  <ResultBadge result={g.overall.result} />
                </div>
                <div className="small text-muted mt-1">
                  {g.overall.percentage !== null ? `${g.overall.percentage}%` : 'No marks yet'} · Grade{' '}
                  {g.overall.grade ?? '-'} · GPA {g.overall.gpa ?? '-'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(insights.lowAttendanceSubjects.length > 0 ||
        insights.failedSubjects.length > 0 ||
        insights.bestSubject) && (
        <div className="mb-3">
          {insights.lowAttendanceSubjects.length > 0 && (
            <div className="alert alert-warning py-2">
              <i className="bi bi-exclamation-triangle-fill me-2" />
              Attendance below {threshold}% in: <b>{insights.lowAttendanceSubjects.join(', ')}</b>
            </div>
          )}
          {insights.failedSubjects.length > 0 && (
            <div className="alert alert-danger py-2">
              <i className="bi bi-x-octagon-fill me-2" />
              Failed in: <b>{insights.failedSubjects.join(', ')}</b>
            </div>
          )}
          {insights.bestSubject && (
            <div className="alert alert-success py-2 mb-0">
              <i className="bi bi-trophy-fill me-2" />
              Best subject: <b>{insights.bestSubject.code}</b> ({insights.bestSubject.percentage}%)
              {insights.weakestSubject && (
                <>
                  {' · '}Needs most improvement: <b>{insights.weakestSubject.code}</b> (
                  {insights.weakestSubject.percentage}%)
                </>
              )}
            </div>
          )}
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="card">
          <EmptyState icon="bi-book" message="No subjects found for this academic year" />
        </div>
      ) : (
        <>
          <div className="row g-3 mb-3">
            <div className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-header bg-white fw-semibold">Attendance % by Subject</div>
                <div className="card-body">
                  <BarChart
                    labels={labels}
                    datasets={[{ label: 'Attendance', data: subjects.map((s) => s.attendancePercentage) }]}
                    max={100}
                    unit="%"
                  />
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-header bg-white fw-semibold">Marks % by Subject</div>
                <div className="card-body">
                  <BarChart
                    labels={labels}
                    datasets={[{ label: 'Marks', data: subjects.map((s) => s.marksPercentage), color: '#0e9f6e' }]}
                    max={100}
                    unit="%"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-header bg-white fw-semibold">Subject-wise Performance</div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Subject</th>
                    <th className="text-center">Present / Total</th>
                    <th className="text-center">Attendance</th>
                    <th className="text-center">Marks</th>
                    <th className="text-center">%</th>
                    <th className="text-center">Grade</th>
                    <th className="text-center">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s) => (
                    <tr key={s.subjectId}>
                      <td>
                        <span className="fw-semibold">{s.code}</span>
                        <div className="small text-muted">{s.name}</div>
                      </td>
                      <td className="text-center">
                        {s.present} / {s.attendanceTotal}
                      </td>
                      <td className="text-center">
                        <PercentBadge value={s.attendancePercentage} isLow={s.attendanceLow} />
                      </td>
                      <td className="text-center">{s.hasResult ? `${s.marksTotal} / ${s.marksMax}` : '-'}</td>
                      <td className="text-center">{s.marksPercentage !== null ? `${s.marksPercentage}%` : '-'}</td>
                      <td className="text-center">
                        <GradeBadge grade={s.grade} />
                      </td>
                      <td className="text-center">
                        <ResultBadge result={s.result} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header bg-white fw-semibold">Exam-wise Marks (published)</div>
            {exams.length === 0 ? (
              <EmptyState icon="bi-hourglass" message="No published exam marks yet" />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Subject</th>
                      <th>Exam</th>
                      <th className="text-center">Marks</th>
                      <th className="text-center">%</th>
                      <th className="text-center">Grade</th>
                      <th className="text-center">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map((e, i) => (
                      <tr key={`${e.subjectCode}-${i}`}>
                        <td className="fw-semibold">{e.subjectCode}</td>
                        <td>{e.name}</td>
                        <td className="text-center">
                          {e.obtained} / {e.maxMarks}
                        </td>
                        <td className="text-center">{e.percentage}%</td>
                        <td className="text-center">
                          <GradeBadge grade={e.grade} />
                        </td>
                        <td className="text-center">
                          <ResultBadge result={e.result} />
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