import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import {
  createDepartment,
  deleteDepartment,
  fetchDepartments,
  updateDepartment,
} from '../../services/masterDataService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import FormModal from '../../components/FormModal';
import ConfirmModal from '../../components/ConfirmModal';
import { getErrorMessage } from '../../utils/errors';

function DepartmentForm({ department, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: department?.name || '',
    code: department?.code || '',
    isActive: department?.isActive ?? true,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { name: form.name.trim(), code: form.code.trim() };
      if (department) {
        await updateDepartment(department.id, { ...payload, isActive: form.isActive });
      } else {
        await createDepartment(payload);
      }
      toast.success(department ? 'Department updated' : 'Department added');
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <FormModal
      title={department ? 'Edit Department' : 'Add Department'}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={saving}
      error={error}
    >
      <div className="mb-3">
        <label className="form-label">Name *</label>
        <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div className="mb-3">
        <label className="form-label">Code *</label>
        <input className="form-control" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
      </div>
      {department && (
        <div className="form-check">
          <input
            id="dept-active"
            type="checkbox"
            className="form-check-input"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          <label htmlFor="dept-active" className="form-check-label">
            Active
          </label>
        </div>
      )}
    </FormModal>
  );
}

export default function DepartmentManager() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(fetchDepartments);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const openForm = (department = null) => {
    setSelected(department);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await deleteDepartment(toDelete.id);
      toast.success('Department deleted');
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
      <PageHeader title="Departments" subtitle="Manage college departments">
        <button className="btn btn-primary" onClick={() => openForm()}>
          <i className="bi bi-plus-lg me-1" />
          Add Department
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
          <EmptyState icon="bi-building" message="No departments yet" />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d.id}>
                    <td className="fw-semibold">{d.code}</td>
                    <td>{d.name}</td>
                    <td>
                      <StatusBadge active={d.isActive} />
                    </td>
                    <td className="text-end text-nowrap">
                      <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openForm(d)} title="Edit">
                        <i className="bi bi-pencil" />
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setToDelete(d)} title="Delete">
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
        <DepartmentForm
          department={selected}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            reload();
          }}
        />
      )}

      <ConfirmModal
        show={Boolean(toDelete)}
        title="Delete department"
        message={`Delete ${toDelete?.name}? If students, teachers or subjects belong to it, deletion will be blocked. Use Edit to mark it Inactive instead.`}
        confirmText="Delete"
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}