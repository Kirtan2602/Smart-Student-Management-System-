import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import {
  createSemester,
  deleteSemester,
  fetchSemesters,
  updateSemester,
} from '../../services/masterDataService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import FormModal from '../../components/FormModal';
import ConfirmModal from '../../components/ConfirmModal';
import { getErrorMessage } from '../../utils/errors';

function SemesterForm({ semester, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    number: semester ? String(semester.number) : '',
    name: semester?.name || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { number: Number(form.number), name: form.name.trim() };
      if (semester) await updateSemester(semester.id, payload);
      else await createSemester(payload);
      toast.success(semester ? 'Semester updated' : 'Semester added');
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <FormModal
      title={semester ? 'Edit Semester' : 'Add Semester'}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={saving}
      error={error}
    >
      <div className="mb-3">
        <label className="form-label">Number (1-12) *</label>
        <input
          type="number"
          min="1"
          max="12"
          className="form-control"
          value={form.number}
          onChange={(e) => setForm({ ...form, number: e.target.value })}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Name *</label>
        <input
          className="form-control"
          placeholder="Semester 5"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>
    </FormModal>
  );
}

export default function SemesterManager() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(fetchSemesters);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const openForm = (semester = null) => {
    setSelected(semester);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await deleteSemester(toDelete.id);
      toast.success('Semester deleted');
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
      <PageHeader title="Semesters" subtitle="Manage semesters">
        <button className="btn btn-primary" onClick={() => openForm()}>
          <i className="bi bi-plus-lg me-1" />
          Add Semester
        </button>
      </PageHeader>

      <div className="card">
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="p-3">
            <ErrorMessage message={error} onRetry={reload} />
          </div>
        ) : data.length === 0 ? (
          <EmptyState icon="bi-layers" message="No semesters yet" />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Number</th>
                  <th>Name</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((s) => (
                  <tr key={s.id}>
                    <td className="fw-semibold">{s.number}</td>
                    <td>{s.name}</td>
                    <td className="text-end text-nowrap">
                      <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openForm(s)} title="Edit">
                        <i className="bi bi-pencil" />
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setToDelete(s)} title="Delete">
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
        <SemesterForm
          semester={selected}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            reload();
          }}
        />
      )}

      <ConfirmModal
        show={Boolean(toDelete)}
        title="Delete semester"
        message={`Delete ${toDelete?.name}? If students or subjects use it, deletion will be blocked.`}
        confirmText="Delete"
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}