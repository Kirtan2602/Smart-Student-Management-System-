import { useCallback, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useDebounce from '../../hooks/useDebounce';
import useLookups from '../../hooks/useLookups';
import useToast from '../../hooks/useToast';
import {
  createSubject,
  deleteSubject,
  fetchSubjects,
  updateSubject,
} from '../../services/masterDataService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import FormModal from '../../components/FormModal';
import ConfirmModal from '../../components/ConfirmModal';
import { getErrorMessage } from '../../utils/errors';

function SubjectForm({ subject, departments, semesters, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    code: subject?.code || '',
    name: subject?.name || '',
    departmentId: subject ? String(subject.departmentId) : '',
    semesterId: subject ? String(subject.semesterId) : '',
    isActive: subject?.isActive ?? true,
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
        code: form.code.trim(),
        name: form.name.trim(),
        departmentId: Number(form.departmentId),
        semesterId: Number(form.semesterId),
      };
      if (subject) await updateSubject(subject.id, { ...payload, isActive: form.isActive });
      else await createSubject(payload);
      toast.success(subject ? 'Subject updated' : 'Subject added');
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <FormModal
      title={subject ? 'Edit Subject' : 'Add Subject'}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={saving}
      error={error}
    >
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label">Code *</label>
          <input className="form-control" value={form.code} onChange={setField('code')} required />
        </div>
        <div className="col-md-8">
          <label className="form-label">Name *</label>
          <input className="form-control" value={form.name} onChange={setField('name')} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Department *</label>
          <select className="form-select" value={form.departmentId} onChange={setField('departmentId')} required>
            <option value="">Select</option>
            {departments
              .filter((d) => d.isActive || String(d.id) === form.departmentId)
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Semester *</label>
          <select className="form-select" value={form.semesterId} onChange={setField('semesterId')} required>
            <option value="">Select</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        {subject && (
          <div className="col-12">
            <div className="form-check">
              <input
                id="subject-active"
                type="checkbox"
                className="form-check-input"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              <label htmlFor="subject-active" className="form-check-label">
                Active
              </label>
            </div>
          </div>
        )}
      </div>
    </FormModal>
  );
}

export default function SubjectManager() {
  const toast = useToast();
  const { departments, semesters } = useLookups();

  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const debouncedSearch = useDebounce(search);

  const fetcher = useCallback(
    () => fetchSubjects({ page, limit: 10, search: debouncedSearch, departmentId, semesterId }),
    [page, debouncedSearch, departmentId, semesterId]
  );
  const { data, loading, error, reload } = useFetch(fetcher);

  const onFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const openForm = (subject = null) => {
    setSelected(subject);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await deleteSubject(toDelete.id);
      toast.success('Subject deleted');
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
      <PageHeader title="Subjects" subtitle="Manage subjects of each department and semester">
        <button className="btn btn-primary" onClick={() => openForm()}>
          <i className="bi bi-plus-lg me-1" />
          Add Subject
        </button>
      </PageHeader>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-12 col-md-5">
              <input
                className="form-control"
                placeholder="Search code or name..."
                value={search}
                onChange={onFilter(setSearch)}
              />
            </div>
            <div className="col-6 col-md-4">
              <select className="form-select" value={departmentId} onChange={onFilter(setDepartmentId)}>
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <select className="form-select" value={semesterId} onChange={onFilter(setSemesterId)}>
                <option value="">All Semesters</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
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
          <EmptyState icon="bi-book" message="No subjects found" />
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Semester</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((s) => (
                    <tr key={s.id}>
                      <td className="fw-semibold">{s.code}</td>
                      <td>{s.name}</td>
                      <td>{s.department.code}</td>
                      <td>{s.semester.number}</td>
                      <td>
                        <StatusBadge active={s.isActive} />
                      </td>
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
            <Pagination meta={data.meta} onPageChange={setPage} />
          </>
        )}
      </div>

      {showForm && (
        <SubjectForm
          subject={selected}
          departments={departments}
          semesters={semesters}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            reload();
          }}
        />
      )}

      <ConfirmModal
        show={Boolean(toDelete)}
        title="Delete subject"
        message={`Delete ${toDelete?.code} - ${toDelete?.name}? Enrollments and assignments of this subject will also be removed. To keep history, use Edit and mark it Inactive instead.`}
        confirmText="Delete"
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}