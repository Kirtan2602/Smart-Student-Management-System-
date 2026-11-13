import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import { fetchMarksSheet, saveMarks } from '../../services/examService';
import { fetchGradeRules } from '../../services/resultService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import GradeBadge from '../../components/GradeBadge';
import ResultBadge from '../../components/ResultBadge';
import { calcPercentage, examTypeLabel, gradeFromRules } from '../../utils/exam';
import { ROLE_HOME } from '../../utils/roles';
import { getErrorMessage } from '../../utils/errors';

function MarksSheet({ sheet, rules, onSaved }) {
  const toast = useToast();
  const { exam, rows, stats, lockedReason } = sheet;

  // Input values string tarike (khali = haju enter nathi karyu)
  const [values, setValues] = useState(() =>
    Object.fromEntries(rows.map((r) => [r.student.id, r.obtainedMarks === null ? '' : String(r.obtainedMarks)]))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const locked = Boolean(lockedReason);

  const isInvalid = (v) => {
    if (v === '') return false;
    const n = Number(v);
    return Number.isNaN(n) || n < 0 || n > exam.maxMarks;
  };

  const handleSave = async () => {
    setError('');
    if (Object.values(values).some(isInvalid)) {
      setError(`Marks must be between 0 and ${exam.maxMarks}`);
      return;
    }
    const filled = Object.entries(values).filter(([, v]) => v !== '');
    if (filled.length === 0) {
      setError('Enter marks for at least one student');
      return;
    }

    setSaving(true);
    try {
      const res = await saveMarks(
        exam.id,
        filled.map(([id, v]) => ({ studentId: Number(id), obtainedMarks: Number(v) }))
      );
      toast.success(res.message);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  if (rows.length === 0) {
    return (
      <div className="card">
        <EmptyState icon="bi-people" message="No students are enrolled in this subject" />
      </div>
    );
  }

  return (
    <>
      {locked && (
        <div className="alert alert-warning py-2">
          <i className="bi bi-lock me-2" />
          {lockedReason}
        </div>
      )}
      {exam.isPublished && !locked && (
        <div className="alert alert-info py-2">
          <i className="bi bi-megaphone me-2" />
          Results of this exam are published. Your changes will be visible to students immediately.
        </div>
      )}
      {error && (
        <div className="alert alert-danger py-2">
          <i className="bi bi-exclamation-circle me-2" />
          {error}
        </div>
      )}

      <div className="row g-3 mb-3">
        {[
          ['Entered', `${stats.entered} / ${stats.enrolled}`],
          ['Passed', stats.passCount],
          ['Failed', stats.failCount],
          ['Average', stats.average ?? '-'],
          ['Highest', stats.highest ?? '-'],
          ['Lowest', stats.lowest ?? '-'],
        ].map(([label, value]) => (
          <div key={label} className="col-4 col-md-2">
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
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Enrollment No</th>
                <th>Name</th>
                <th style={{ width: 170 }}>Marks (out of {exam.maxMarks})</th>
                <th className="text-center">%</th>
                <th className="text-center">Grade</th>
                <th className="text-center">Result</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const v = values[r.student.id];
                const valid = v !== '' && !isInvalid(v);
                const percentage = valid ? calcPercentage(Number(v), exam.maxMarks) : null;
                const result = valid ? (Number(v) >= exam.passingMarks ? 'PASS' : 'FAIL') : null;

                return (
                  <tr key={r.student.id}>
                    <td className="fw-semibold">{r.student.enrollmentNo}</td>
                    <td>
                      {r.student.firstName} {r.student.lastName}
                    </td>
                    <td>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        max={exam.maxMarks}
                        className={`form-control form-control-sm ${isInvalid(v) ? 'is-invalid' : ''}`}
                        value={v}
                        disabled={locked}
                        placeholder="-"
                        onChange={(e) => setValues((prev) => ({ ...prev, [r.student.id]: e.target.value }))}
                      />
                    </td>
                    <td className="text-center">{percentage !== null ? `${percentage}%` : '-'}</td>
                    <td className="text-center">
                      <GradeBadge grade={gradeFromRules(percentage, rules)} />
                    </td>
                    <td className="text-center">
                      <ResultBadge result={result} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
          <small className="text-muted">Khali rakheli marks save nahi thay. Pass marks: {exam.passingMarks}</small>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || locked}>
            {saving ? 'Saving...' : 'Save Marks'}
          </button>
        </div>
      </div>
    </>
  );
}

export default function MarksEntry() {
  const { id } = useParams();
  const { user } = useAuth();
  const base = ROLE_HOME[user.role];

  const sheetFetcher = useCallback(() => fetchMarksSheet(id), [id]);
  const sheetFetch = useFetch(sheetFetcher);
  const rulesFetch = useFetch(fetchGradeRules);

  const error = sheetFetch.error || rulesFetch.error;
  if (error) return <ErrorMessage message={error} onRetry={sheetFetch.reload} />;
  if (sheetFetch.loading || rulesFetch.loading || !sheetFetch.data || !rulesFetch.data) {
    return <Loader />;
  }

  const { exam } = sheetFetch.data;

  return (
    <>
      <PageHeader
        title={exam.name}
        subtitle={`${exam.subject.code} · ${exam.subject.name} · ${examTypeLabel(exam.type)} · Max ${exam.maxMarks}, Pass ${exam.passingMarks}`}
      >
        <span className={`badge align-self-center ${exam.isPublished ? 'text-bg-success' : 'text-bg-secondary'}`}>
          {exam.isPublished ? 'Published' : 'Draft'}
        </span>
        <Link to={`${base}/exams`} className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-1" />
          Back
        </Link>
      </PageHeader>

      <MarksSheet sheet={sheetFetch.data} rules={rulesFetch.data} onSaved={sheetFetch.reload} />
    </>
  );
}