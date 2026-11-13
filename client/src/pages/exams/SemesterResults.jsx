import { useCallback, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useLookups from '../../hooks/useLookups';
import { fetchSemesterResults } from '../../services/resultService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import GradeBadge from '../../components/GradeBadge';
import ResultBadge from '../../components/ResultBadge';

export default function SemesterResults() {
  const { departments, semesters, academicYears } = useLookups();

  const [departmentId, setDepartmentId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');

  const ready = Boolean(departmentId && semesterId);

  const fetcher = useCallback(
    () =>
      ready
        ? fetchSemesterResults({ departmentId, semesterId, academicYearId })
        : Promise.resolve(null),
    [ready, departmentId, semesterId, academicYearId]
  );
  const { data, loading, error, reload } = useFetch(fetcher);

  return (
    <>
      <PageHeader
        title="Semester Results"
        subtitle="Class result of a department and semester (published exams only)"
      />

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-12 col-md-4">
              <label className="form-label small text-muted mb-1">Department</label>
              <select className="form-select" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-4">
              <label className="form-label small text-muted mb-1">Semester</label>
              <select className="form-select" value={semesterId} onChange={(e) => setSemesterId(e.target.value)}>
                <option value="">Select semester</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-4">
              <label className="form-label small text-muted mb-1">Academic Year</label>
              <select className="form-select" value={academicYearId} onChange={(e) => setAcademicYearId(e.target.value)}>
                <option value="">Current year</option>
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {!ready ? (
        <div className="card">
          <EmptyState icon="bi-award" message="Select department and semester to view results" />
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
              ['Passed', data.stats.pass],
              ['Failed', data.stats.fail],
              ['Incomplete', data.stats.incomplete],
              ['Pass %', data.stats.passPercentage !== null ? `${data.stats.passPercentage}%` : '-'],
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
            <div className="card-header bg-white fw-semibold">
              {data.department.code} · {data.semester.name} · {data.academicYear}
            </div>
            {data.rows.length === 0 ? (
              <EmptyState icon="bi-people" message="No students are enrolled for this semester" />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Enrollment No</th>
                      <th>Name</th>
                      {data.subjects.map((s) => (
                        <th key={s.id} className="text-center" title={s.name}>
                          {s.code}
                        </th>
                      ))}
                      <th className="text-center">Overall %</th>
                      <th className="text-center">Grade</th>
                      <th className="text-center">GPA</th>
                      <th className="text-center">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((r) => {
                      const bySubject = Object.fromEntries(r.subjects.map((s) => [s.subjectId, s]));
                      return (
                        <tr key={r.student.id}>
                          <td className="fw-semibold">{r.student.enrollmentNo}</td>
                          <td>
                            {r.student.firstName} {r.student.lastName}
                          </td>
                          {data.subjects.map((s) => {
                            const res = bySubject[s.id];
                            return (
                              <td
                                key={s.id}
                                className={`text-center small ${res?.result === 'FAIL' ? 'text-danger fw-semibold' : ''}`}
                              >
                                {res?.hasResult ? (
                                  <>
                                    {res.percentage}% <GradeBadge grade={res.grade} />
                                  </>
                                ) : (
                                  '-'
                                )}
                              </td>
                            );
                          })}
                          <td className="text-center">
                            {r.overall?.percentage !== null && r.overall?.percentage !== undefined
                              ? `${r.overall.percentage}%`
                              : '-'}
                          </td>
                          <td className="text-center">
                            <GradeBadge grade={r.overall?.grade} />
                          </td>
                          <td className="text-center">{r.overall?.gpa ?? '-'}</td>
                          <td className="text-center">
                            <ResultBadge result={r.overall?.result} />
                          </td>
                        </tr>
                      );
                    })}
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