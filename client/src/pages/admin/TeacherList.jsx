import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useDebounce from '../../hooks/useDebounce';
import useLookups from '../../hooks/useLookups';
import useToast from '../../hooks/useToast';
import { fetchTeachers, setTeacherStatus } from '../../services/teacherService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import { getErrorMessage } from '../../utils/errors';

export default function TeacherList() {
  const toast = useToast();
  const { departments } = useLookups();

  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const debouncedSearch = useDebounce(search);

  const fetcher = useCallback(
    () => fetchTeachers({ page, limit: 10, search: debouncedSearch, departmentId, isActive: status }),
    [page, debouncedSearch, departmentId, status]
  );
  const { data, loading, error, reload } = useFetch(fetcher);

  const onFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const confirmToggle = async () => {
    setBusy(true);
    try {
      await setTeacherStatus(target.id, !target.isActive);
      toast.success(`Teacher ${target.isActive ? 'deactivated' : 'activated'} successfully`);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
      setTarget(null);
    }
  };

  return (
    <>
      <PageHeader title="Teachers" subtitle="Manage all teacher records">
        <Link to="/admin/teachers/new" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1" />
          Add Teacher
        </Link>
      </PageHeader>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-12 col-md-5">
              <input
                className="form-control"
                placeholder="Search name, employee code, email..."
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
              <select className="form-select" value={status} onChange={onFilter(setStatus)}>
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
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
          <EmptyState icon="bi-person-badge" message="No teachers found" />
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Employee Code</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Subjects</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((t) => (
                    <tr key={t.id}>
                      <td className="fw-semibold">{t.employeeCode}</td>
                      <td>
                        {t.firstName} {t.lastName}
                        <div className="small text-muted">{t.user.email}</div>
                      </td>
                      <td>{t.department.code}</td>
                      <td>{t._count.teacherSubjects}</td>
                      <td>
                        <StatusBadge active={t.isActive} />
                      </td>
                      <td className="text-end text-nowrap">
                        <Link to={`/admin/teachers/${t.id}`} className="btn btn-sm btn-outline-primary me-1" title="View">
                          <i className="bi bi-eye" />
                        </Link>
                        <Link to={`/admin/teachers/${t.id}/edit`} className="btn btn-sm btn-outline-secondary me-1" title="Edit">
                          <i className="bi bi-pencil" />
                        </Link>
                        <button
                          className={`btn btn-sm ${t.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          title={t.isActive ? 'Deactivate' : 'Activate'}
                          onClick={() => setTarget(t)}
                        >
                          <i className={`bi ${t.isActive ? 'bi-person-x' : 'bi-person-check'}`} />
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

      <ConfirmModal
        show={Boolean(target)}
        title={target?.isActive ? 'Deactivate teacher' : 'Activate teacher'}
        message={
          target?.isActive
            ? `Deactivate ${target?.firstName} ${target?.lastName}? They will not be able to login.`
            : `Activate ${target?.firstName} ${target?.lastName}?`
        }
        confirmText={target?.isActive ? 'Deactivate' : 'Activate'}
        busy={busy}
        onConfirm={confirmToggle}
        onCancel={() => setTarget(null)}
      />
    </>
  );
}