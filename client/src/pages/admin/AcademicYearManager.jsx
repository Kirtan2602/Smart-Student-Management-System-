import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import {
  createAcademicYear,
  deleteAcademicYear,
  fetchAcademicYears,
  updateAcademicYear,
} from '../../services/masterDataService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import FormModal from '../../components/FormModal';
import ConfirmModal from '../../components/ConfirmModal';
import { getErrorMessage } from '../../utils/errors';
import { formatDate, toDateInput } from '../../utils/format';

function AcademicYearForm({ year, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: year?.name || '',
    startDate: toDateInput(year?.startDate),
    endDate: toDateInput(year?.endDate),
    isCurrent: year?.isCurrent ?? false,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        isCurrent: form.isCurrent,
      };
      if (year) await updateAcademicYear(year.id, payload);
      else await createAcademicYear(payload);
      toast.success(year ? 'Academic year updated' : 'Academic year added');
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <FormModal
      title={year ? 'Edit Academic Year' : 'Add Academic Year'}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={saving}
      error={error}
    >
      <div className="mb-3">
        <label className="form-label">Name *</label>
        <input
          className="form-control"
          placeholder="2026-27"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>
      <div className="row g-3 mb-3">
        <div className="col-6">
          <label className="form-label">Start Date *</label>
          <input
            type="date"
            className="form-control"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            required
          />
        </div>
        <div className="col-6">
          <label className="form-label">End Date *</label>
          <input
            type="date"
            className="form-control"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="form-check">
        <input
          id="year-current"
          type="checkbox"
          className="form-check-input"
          checked={form.isCurrent}
          disabled={year?.isCurrent}
          onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })}
        />
        <label htmlFor="year-current" className="form-check-label">
          Set as current academic year
        </label>
        {year?.isCurrent && (
          <div className="form-text">To change the current year, set another year as current.</div>
        )}
      </div>
    </FormModal>
  );
}

export default function AcademicYearManager() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(fetchAcademicYears);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const openForm = (year = null) => {
    setSelected(year);
    setShowForm(true);
  };

  const makeCurrent = async (year) => {
    try {
      await updateAcademicYear(year.id, { isCurrent: true });
      toast.success(`${year.name} is now the current academic year`);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await deleteAcademicYear(toDelete.id);
      toast.success('Academic year deleted');
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
      <PageHeader title="Academic Years" subtitle="Manage academic years">
        <button className="btn btn-primary" onClick={() => openForm()}>
          <i className="bi bi-plus-lg me-1" />
          Add Academic Year
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
          <EmptyState icon="bi-calendar3" message="No academic years yet" />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((y) => (
                  <tr key={y.id}>
                    <td className="fw-semibold">{y.name}</td>
                    <td>{formatDate(y.startDate)}</td>
                    <td>{formatDate(y.endDate)}</td>
                    <td>
                      {y.isCurrent ? (
                        <span className="badge text-bg-success">Current</span>
                      ) : (
                        <button className="btn btn-sm btn-outline-success" onClick={() => makeCurrent(y)}>
                          Set as current
                        </button>
                      )}
                    </td>
                    <td className="text-end text-nowrap">
                      <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openForm(y)} title="Edit">
                        <i className="bi bi-pencil" />
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setToDelete(y)} title="Delete">
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
        <AcademicYearForm
          year={selected}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            reload();
          }}
        />
      )}

      <ConfirmModal
        show={Boolean(toDelete)}
        title="Delete academic year"
        message={`Delete ${toDelete?.name}? If any records use it, deletion will be blocked.`}
        confirmText="Delete"
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}