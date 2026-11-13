import { useCallback, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useLookups from '../../hooks/useLookups';
import { fetchMyResults } from '../../services/resultService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import GradeBadge from '../../components/GradeBadge';
import ResultBadge from '../../components/ResultBadge';
import { examTypeLabel } from '../../utils/exam';

export default function MyResults() {
  const { academicYears } = useLookups();
  const [academicYearId, setAcademicYearId] = useState('');

  const fetcher = useCallback(() => fetchMyResults({ academicYearId }), [academicYearId]);
  const { data, loading, error, reload } = useFetch(fetcher);

  // Pehli vaar full-page loader; year badlo tyare page jaay nahi
  if (loading && !data) return <Loader />;
  if (error && !data) return <ErrorMessage message={error} onRetry={reload} />;
  if (!data) return <Loader />;

  return (
    <>
      <PageHeader title="My Results" subtitle={`Academic Year ${data.academicYear.name} · published results only`}>
        <select
          className="form-select"
          value={academicYearId}
          onChange={(e) => setAcademicYearId(e.target.value)}
          aria-label="Academic year"
        >
          <option value="">Current year</option>
          {academicYears.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name}
            </option>
          ))}
        </select>
      </PageHeader>

      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data.semesters.length === 0 ? (
        <div className="card">
          <EmptyState icon="bi-journal-text" message="No subjects found for this academic year" />
        </div>
      ) : (
        <div className={loading ? 'opacity-50' : ''}>
          {data.semesters.map((group) => (
            <div key={group.semester.id} className="mb-4">
              <div className="card mb-3">
                <div className="card-body">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div>
                      <div className="text-muted small">{group.semester.name} Result</div>
                      <div className="fs-4 fw-bold">
                        <ResultBadge result={group.overall.result} />
                      </div>
                    </div>
                    <div className="d-flex flex-wrap gap-4">
                      <div>
                        <div className="text-muted small">Overall %</div>
                        <div className="fw-bold fs-5">
                          {group.overall.percentage !== null ? `${group.overall.percentage}%` : '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted small">Grade</div>
                        <div className="fs-5">
                          <GradeBadge grade={group.overall.grade} />
                        </div>
                      </div>
                      <div>
                        <div className="text-muted small">GPA</div>
                        <div className="fw-bold fs-5">{group.overall.gpa ?? '-'}</div>
                      </div>
                      <div>
                        <div className="text-muted small">Subjects declared</div>
                        <div className="fw-bold fs-5">
                          {group.overall.subjectsDeclared} / {group.overall.subjectsTotal}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                {group.subjects.map((s) => (
                  <div key={s.subjectId} className="col-12 col-xl-6">
                    <div className={`card h-100 ${s.result === 'FAIL' ? 'border-danger' : ''}`}>
                      <div className="card-header bg-white d-flex justify-content-between align-items-center">
                        <div>
                          <span className="fw-semibold">{s.code}</span>
                          <span className="text-muted small"> · {s.name}</span>
                        </div>
                        {s.hasResult ? (
                          <div className="d-flex align-items-center gap-2">
                            <span className="small">
                              {s.total}/{s.max} ({s.percentage}%)
                            </span>
                            <GradeBadge grade={s.grade} />
                            <ResultBadge result={s.result} />
                          </div>
                        ) : (
                          <span className="badge text-bg-secondary">Not declared yet</span>
                        )}
                      </div>
                      {s.exams.length === 0 ? (
                        <EmptyState icon="bi-hourglass" message="No published exams yet" />
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-sm align-middle mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>Exam</th>
                                <th className="text-center">Marks</th>
                                <th className="text-center">%</th>
                                <th className="text-center">Grade</th>
                                <th className="text-center">Result</th>
                              </tr>
                            </thead>
                            <tbody>
                              {s.exams.map((e) => (
                                <tr key={e.examId}>
                                  <td>
                                    {e.name}
                                    <div className="small text-muted">{examTypeLabel(e.type)}</div>
                                  </td>
                                  <td className="text-center">
                                    {e.obtained !== null ? `${e.obtained} / ${e.maxMarks}` : '-'}
                                  </td>
                                  <td className="text-center">{e.percentage !== null ? `${e.percentage}%` : '-'}</td>
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
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}