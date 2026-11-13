import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import {
  createExam,
  deleteExam,
  fetchExams,
  setExamPublished,
  updateExam,
} from '../../services/examService';
import { fetchAttendanceSubjects } from '../../services/attendanceService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import FormModal from '../../components/FormModal';
import ConfirmModal from '../../components/ConfirmModal';
import { EXAM_TYPES, examTypeLabel } from '../../utils/exam';
import { ROLE_HOME } from '../../utils/roles';
import { getErrorMessage } from '../../utils/errors';
import { formatDate, toDateInput } from '../../utils/format';

function ExamFormModal({ exam, subjects, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: exam?.name || '',
    type: exam?.type || 'UNIT_TEST',
    subjectId: exam ? String(exam.subjectId) : '',
    maxMarks: exam ? String(exam.maxMarks) : '',
    passingMarks: exam ? String(exam.passingMarks) : '',
    examDate: toDateInput(exam?.examDate),
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      name: form.name.trim(),
      type: form.type,
      maxMarks: Number(form.maxMarks),
      // Khali hoy to backend default percentage thi calculate kare
      passingMarks: form.passingMarks === '' ? null : Number(form.passingMarks),
      examDate: form.examDate || null,
    };

    try {
      if (exam) {
        await updateExam(exam.id, payload);
      } else {
        await createExam({ ...payload, subjectId: Number(form.subjectId) });
      }
      toast.success(exam ? 'Exam updated' : 'Exam created');
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <FormModal
      title={exam ? 'Edit Exam' : 'Create Exam'}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={saving}
      error={error}
      size="modal-lg"
    >
      <div className="row g-3">
        <div className="col-md-8">
          <label className="form-label">Exam Name *</label>
          <input
            className="form-control"
            placeholder="Unit Test 1"
            value={form.name}
            onChange={setField('name')}
            required
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Exam Type *</label>
          <select className="form-select" value={form.type} onChange={setField('type')} required>
            {EXAM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12">
          <label className="form-label">Subject *</label>
          <select
            className="form-select"
            value={form.subjectId}
            onChange={setField('subjectId')}
            disabled={Boolean(exam)}
            required
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} · {s.name} ({s.department.code} - Sem {s.semester.number})
              </option>
            ))}
          </select>
          {exam && <div className="form-text">Subject cannot be changed after the exam is created.</div>}
        </div>
        <div className="col-md-4">
          <label className="form-label">Maximum Marks *</label>
          <input
            type="number"
            min="1"
            max="500"
            className="form-control"
            value={form.maxMarks}
            onChange={setField('maxMarks')}
            required
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Passing Marks</label>
          <input
            type="number"
            min="0"
            className="form-control"
            placeholder="Auto (default %)"
            value={form.passingMarks}
            onChange={setField('passingMarks')}
          />
          <div className="form-text">Khali rakho to default pass percentage vapray.</div>
        </div>
        <div className="col-md-4">
          <label className="form-label">Exam Date</label>
          <input type="date" className="form-control" value={form.examDate} onChange={setField('examDate')} />
        </div>
      </div>
    </FormModal>
  );
}

const ACTION_TEXT = {
  publish: {
    title: 'Publish results',
    confirm: 'Publish',
    message: (e) =>
      `Publish results of "${e.name}"? Students will be able to see their marks. After publishing, teachers cannot edit the marks (only the admin can).`,
  },
  unpublish: {
    title: 'Unpublish results',
    confirm: 'Unpublish',
    message: (e) => `Unpublish "${e.name}"? Students will no longer see these marks.`,
  },
  delete: {
    title: 'Delete exam',
    confirm: 'Delete',
    message: (e) => `Delete "${e.name}"? This cannot be undone.`,
  },
};

export default function ExamList() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user.role === 'ADMIN';
  const base = ROLE_HOME[user.role];

  const subjectsFetch = useFetch(fetchAttendanceSubjects);

  const [subjectId, setSubjectId] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState(null); // { type, exam }
  const [busy, setBusy] = useState(false);

  const fetcher = useCallback(
    () => fetchExams({ page, limit: 10, subjectId, type, isPublished: status }),
    [page, subjectId, type, status]
  );
  const { data, loading, error, reload } = useFetch(fetcher);

  const onFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const openForm = (exam = null) => {
    setSelected(exam);
    setShowForm(true);
  };

  const runAction = async () => {
    setBusy(true);
    try {
      if (action.type === 'delete') {
        await deleteExam(action.exam.id);
        toast.success('Exam deleted');
      } else {
        const publish = action.type === 'publish';
        await setExamPublished(action.exam.id, publish);
        toast.success(publish ? 'Results published' : 'Results unpublished');
      }
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
      setAction(null);
    }
  };

  const text = action ? ACTION_TEXT[action.type] : null;

  return (
    <>
      <PageHeader title="Exams & Marks" subtitle="Create exams, enter marks and publish results">
        <button className="btn btn-primary" onClick={() => openForm()}>
          <i className="bi bi-plus-lg me-1" />
          Create Exam
        </button>
      </PageHeader>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-12 col-md-6">
              <select className="form-select" value={subjectId} onChange={onFilter(setSubjectId)}>
                <option value="">All Subjects</option>
                {(subjectsFetch.data || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} · {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <select className="form-select" value={type} onChange={onFilter(setType)}>
                <option value="">All Types</option>
                {EXAM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <select className="form-select" value={status} onChange={onFilter(setStatus)}>
                <option value="">All Status</option>
                <option value="true">Published</option>
                <option value="false">Draft</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="p-3">
            <ErrorMessage message={error} onRetry={reload} />
          </div>
        ) : data.items.length === 0 ? (
          <EmptyState icon="bi-journal-text" message="No exams found. Create your first exam." />
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Exam</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th className="text-center">Max / Pass</th>
                    <th className="text-center">Marks Entered</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((e) => {
                    const locked = !isAdmin && e.isPublished;
                    return (
                      <tr key={e.id}>
                        <td>
                          <div className="fw-semibold">{e.name}</div>
                          <div className="small text-muted">{examTypeLabel(e.type)}</div>
                        </td>
                        <td>
                          <span className="fw-semibold">{e.subject.code}</span>
                          <div className="small text-muted">{e.subject.name}</div>
                        </td>
                        <td>{e.examDate ? formatDate(e.examDate) : '-'}</td>
                        <td className="text-center">
                          {e.maxMarks} / {e.passingMarks}
                        </td>
                        <td className="text-center">
                          {e._count.marks} / {e.enrolled}
                        </td>
                        <td>
                          <span className={`badge ${e.isPublished ? 'text-bg-success' : 'text-bg-secondary'}`}>
                            {e.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="text-end text-nowrap">
                          <Link
                            to={`${base}/exams/${e.id}/marks`}
                            className="btn btn-sm btn-primary me-1"
                            title="Enter / view marks"
                          >
                            <i className="bi bi-pencil-square" />
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-secondary me-1"
                            title="Edit exam"
                            disabled={locked}
                            onClick={() => openForm(e)}
                          >
                            <i className="bi bi-gear" />
                          </button>
                          {e.isPublished ? (
                            isAdmin && (
                              <button
                                className="btn btn-sm btn-outline-warning me-1"
                                title="Unpublish"
                                onClick={() => setAction({ type: 'unpublish', exam: e })}
                              >
                                <i className="bi bi-eye-slash" />
                              </button>
                            )
                          ) : (
                            <button
                              className="btn btn-sm btn-outline-success me-1"
                              title="Publish results"
                              disabled={e._count.marks === 0}
                              onClick={() => setAction({ type: 'publish', exam: e })}
                            >
                              <i className="bi bi-megaphone" />
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete"
                            disabled={locked}
                            onClick={() => setAction({ type: 'delete', exam: e })}
                          >
                            <i className="bi bi-trash" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination meta={data.meta} onPageChange={setPage} />
          </>
        )}
      </div>

      {showForm && (
        <ExamFormModal
          exam={selected}
          subjects={subjectsFetch.data || []}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            reload();
          }}
        />
      )}

      <ConfirmModal
        show={Boolean(action)}
        title={text?.title}
        message={action && text.message(action.exam)}
        confirmText={text?.confirm}
        busy={busy}
        onConfirm={runAction}
        onCancel={() => setAction(null)}
      />
    </>
  );
}