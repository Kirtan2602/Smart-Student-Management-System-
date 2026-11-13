import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import {
  createGradeRule,
  deleteGradeRule,
  fetchGradeRules,
  updateGradeRule,
} from '../../services/resultService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import FormModal from '../../components/FormModal';
import ConfirmModal from '../../components/ConfirmModal';
import { getErrorMessage } from '../../utils/errors';

function GradeRuleForm({ rule, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    grade: rule?.grade || '',
    minPercent: rule ? String(rule.minPercent) : '',
    gradePoint: rule ? String(rule.gradePoint) : '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        grade: form.grade.trim(),
        minPercent: Number(form.minPercent),
        gradePoint: Number(form.gradePoint),
      };
      if (rule) await updateGradeRule(rule.id, payload);
      else await createGradeRule(payload);
      toast.success(rule ? 'Grade rule updated' : 'Grade rule added');
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  const isLowest = rule && rule.minPercent === 0;

  return (
    <FormModal
      title={rule ? 'Edit Grade Rule' : 'Add Grade Rule'}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={saving}
      error={error}
    >
      <div className="mb-3">
        <label className="form-label">Grade *</label>
        <input className="form-control" placeholder="A+" value={form.grade} onChange={setField('grade')} required />
      </div>
      <div className="mb-3">
        <label className="form-label">Minimum Percentage *</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="100"
          className="form-control"
          value={form.minPercent}
          onChange={setField('minPercent')}
          disabled={isLowest}
          required
        />
        {isLowest && <div className="form-text">The lowest grade must always start from 0%.</div>}
      </div>
      <div className="mb-3">
        <label className="form-label">Grade Point (0-10) *</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="10"
          className="form-control"
          value={form.gradePoint}
          onChange={setField('gradePoint')}
          required
        />
      </div>
    </FormModal>
  );
}

export default function GradeRules() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(fetchGradeRules);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const openForm = (rule = null) => {
    setSelected(rule);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await deleteGradeRule(toDelete.id);
      toast.success('Grade rule deleted');
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
      setToDelete(null);
    }
  };

  return (
    <>
      <PageHeader title="Grade Rules" subtitle="Configure how percentage converts to grade">
        <button className="btn btn-primary" onClick={() => openForm()}>
          <i className="bi bi-plus-lg me-1" />
          Add Grade
        </button>
      </PageHeader>

      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2" />
        A student gets the <b>highest grade whose minimum percentage is reached</b>. Pass/fail of an exam is decided by
        its <b>passing marks</b> (set while creating the exam). A subject is passed when the total marks of all
        published exams are at least the total passing marks.
      </div>

      <div className="card">
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="p-3">
            <ErrorMessage message={error} onRetry={reload} />
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState icon="bi-sliders" message="No grade rules. Run: npm run db:seed:grades" />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Grade</th>
                  <th>Minimum %</th>
                  <th>Grade Point</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="badge text-bg-primary fs-6">{r.grade}</span>
                    </td>
                    <td>{r.minPercent}% and above</td>
                    <td>{r.gradePoint}</td>
                    <td className="text-end text-nowrap">
                      <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openForm(r)} title="Edit">
                        <i className="bi bi-pencil" />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setToDelete(r)}
                        disabled={r.minPercent === 0}
                        title={r.minPercent === 0 ? 'Lowest grade cannot be deleted' : 'Delete'}
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <GradeRuleForm
          rule={selected}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            reload();
          }}
        />
      )}

      <ConfirmModal
        show={Boolean(toDelete)}
        title="Delete grade rule"
        message={`Delete grade ${toDelete?.grade}?`}
        confirmText="Delete"
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}