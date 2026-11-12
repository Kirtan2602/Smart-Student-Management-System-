import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import { fetchAttendanceSubjects, fetchSheet, saveAttendance } from '../../services/attendanceService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { getErrorMessage } from '../../utils/errors';
import { todayInput } from '../../utils/format';

function AttendanceSheet({ sheet, onSaved }) {
  const toast = useToast();
  // Navu lecture hoy to badha "Present" thi start (teacher fakt absent mark kare)
  const [marks, setMarks] = useState(() =>
    Object.fromEntries(sheet.students.map((s) => [s.id, s.status || 'PRESENT']))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const locked = Boolean(sheet.lockedReason);
  const total = sheet.students.length;
  const presentCount = Object.values(marks).filter((v) => v === 'PRESENT').length;

  const setAll = (status) =>
    setMarks(Object.fromEntries(sheet.students.map((s) => [s.id, status])));
  const setOne = (id, status) => setMarks((m) => ({ ...m, [id]: status }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await saveAttendance({
        subjectId: sheet.subject.id,
        date: sheet.date,
        lectureNo: sheet.lectureNo,
        records: sheet.students.map((s) => ({ studentId: s.id, status: marks[s.id] })),
      });
      toast.success(res.message);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  if (total === 0) {
    return (
      <div className="card">
        <EmptyState icon="bi-people" message="No students are enrolled in this subject" />
      </div>
    );
  }

  return (
    <>
      {sheet.isExisting && !locked && (
        <div className="alert alert-info py-2">
          <i className="bi bi-info-circle me-2" />
          Attendance is already marked for this lecture. You are editing it.
        </div>
      )}
      {locked && (
        <div className="alert alert-warning py-2">
          <i className="bi bi-lock me-2" />
          {sheet.lockedReason}
        </div>
      )}
      {error && (
        <div className="alert alert-danger py-2">
          <i className="bi bi-exclamation-circle me-2" />
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <span className="fw-semibold">
              {sheet.subject.code} · {sheet.subject.name}
            </span>
            <span className="ms-3 badge text-bg-success">Present: {presentCount}</span>
            <span className="ms-1 badge text-bg-danger">Absent: {total - presentCount}</span>
          </div>
          {!locked && (
            <div className="btn-group btn-group-sm">
              <button type="button" className="btn btn-outline-success" onClick={() => setAll('PRESENT')}>
                All Present
              </button>
              <button type="button" className="btn btn-outline-danger" onClick={() => setAll('ABSENT')}>
                All Absent
              </button>
            </div>
          )}
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Enrollment No</th>
                <th>Name</th>
                <th className="text-end">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {sheet.students.map((s) => (
                <tr key={s.id}>
                  <td className="fw-semibold">{s.enrollmentNo}</td>
                  <td>
                    {s.firstName} {s.lastName}
                  </td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm">
                      <button
                        type="button"
                        disabled={locked}
                        className={`btn ${marks[s.id] === 'PRESENT' ? 'btn-success' : 'btn-outline-success'}`}
                        onClick={() => setOne(s.id, 'PRESENT')}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        disabled={locked}
                        className={`btn ${marks[s.id] === 'ABSENT' ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={() => setOne(s.id, 'ABSENT')}
                      >
                        Absent
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card-footer bg-white text-end">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || locked}>
            {saving ? 'Saving...' : sheet.isExisting ? 'Update Attendance' : 'Save Attendance'}
          </button>
        </div>
      </div>
    </>
  );
}

export default function MarkAttendance() {
  const [params] = useSearchParams();
  const [subjectId, setSubjectId] = useState(params.get('subjectId') || '');
  const [date, setDate] = useState(params.get('date') || todayInput());
  const [lectureNo, setLectureNo] = useState(params.get('lectureNo') || '1');

  const subjectsFetch = useFetch(fetchAttendanceSubjects);

  const sheetFetcher = useCallback(
    () => (subjectId && date ? fetchSheet({ subjectId, date, lectureNo }) : Promise.resolve(null)),
    [subjectId, date, lectureNo]
  );
  const sheetFetch = useFetch(sheetFetcher);

  const subjects = subjectsFetch.data || [];

  return (
    <>
      <PageHeader title="Mark Attendance" subtitle="Select subject, date and lecture" />

      <div className="card mb-3">
        <div className="card-body">
          {subjectsFetch.error && <ErrorMessage message={subjectsFetch.error} onRetry={subjectsFetch.reload} />}
          <div className="row g-2">
            <div className="col-12 col-md-6">
              <label className="form-label small text-muted mb-1">Subject</label>
              <select className="form-select" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} · {s.name} ({s.department.code} - Sem {s.semester.number})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small text-muted mb-1">Date</label>
              <input
                type="date"
                className="form-control"
                value={date}
                max={todayInput()}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small text-muted mb-1">Lecture No</label>
              <select className="form-select" value={lectureNo} onChange={(e) => setLectureNo(e.target.value)}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    Lecture {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {!subjectsFetch.loading && subjects.length === 0 && !subjectsFetch.error && (
            <div className="alert alert-warning mt-3 mb-0">
              No subjects available. A teacher must be assigned subjects (Teachers → Assign Subjects).
            </div>
          )}
        </div>
      </div>

      {!subjectId || !date ? (
        <div className="card">
          <EmptyState icon="bi-calendar-check" message="Select a subject and date to load the student list" />
        </div>
        ) : sheetFetch.loading || (!sheetFetch.data && !sheetFetch.error) ? (
        <Loader />
      ) : sheetFetch.error ? (
        <ErrorMessage message={sheetFetch.error} onRetry={sheetFetch.reload} />
      ) : (
        <AttendanceSheet sheet={sheetFetch.data} onSaved={sheetFetch.reload} />
      )}
    </>
  );
}