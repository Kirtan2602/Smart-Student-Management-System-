import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useDebounce from '../../hooks/useDebounce';
import useLookups from '../../hooks/useLookups';
import useToast from '../../hooks/useToast';
import { fetchStudents, setStudentStatus } from '../../services/studentService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import { getErrorMessage } from '../../utils/errors';

export default function StudentList() {
  const toast = useToast();
  const { departments, semesters } = useLookups();

  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const debouncedSearch = useDebounce(search);

  const fetcher = useCallback(
    () =>
      fetchStudents({
        page,
        limit: 10,
        search: debouncedSearch,
        departmentId,
        semesterId,
        isActive: status,
      }),
    [page, debouncedSearch, departmentId, semesterId, status]
  );
  const { data, loading, error, reload } = useFetch(fetcher);

  // Filter badlay tyare pehla page par jao
  const onFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const confirmToggle = async () => {
    setBusy(true);
    try {
      await setStudentStatus(target.id, !target.isActive);
      toast.success(`Student ${target.isActive ? 'deactivated' : 'activated'} successfully`);
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
      <PageHeader title="Students" subtitle="Manage all student records">
        <Link to="/admin/students/new" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1" />
          Add Student
        </Link>
      </PageHeader>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-12 col-md-4">
              <input
                className="form-control"
                placeholder="Search name, enrollment no, email..."
                value={search}
                onChange={onFilter(setSearch)}
              />
            </div>
            <div className="col-6 col-md-3">
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
            <div className="col-12 col-md-2">
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
          <EmptyState icon="bi-people" message="No students found" />
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Enrollment No</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Sem</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((s) => (
                    <tr key={s.id}>
                      <td className="fw-semibold">{s.enrollmentNo}</td>
                      <td>
                        {s.firstName} {s.lastName}
                        <div className="small text-muted">{s.user.email}</div>
                      </td>
                      <td>{s.department.code}</td>
                      <td>{s.semester.number}</td>
                      <td>
                        <StatusBadge active={s.isActive} />
                      </td>
                      <td className="text-end text-nowrap">
                        <Link to={`/admin/students/${s.id}`} className="btn btn-sm btn-outline-primary me-1" title="View">
                          <i className="bi bi-eye" />
                        </Link>
                        <Link to={`/admin/students/${s.id}/edit`} className="btn btn-sm btn-outline-secondary me-1" title="Edit">
                          <i className="bi bi-pencil" />
                        </Link>
                        <button
                          className={`btn btn-sm ${s.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          title={s.isActive ? 'Deactivate' : 'Activate'}
                          onClick={() => setTarget(s)}
                        >
                          <i className={`bi ${s.isActive ? 'bi-person-x' : 'bi-person-check'}`} />
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
        title={target?.isActive ? 'Deactivate student' : 'Activate student'}
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