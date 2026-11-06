import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useLookups from '../../hooks/useLookups';
import useToast from '../../hooks/useToast';
import { assignTeacherSubjects, fetchTeacher } from '../../services/teacherService';
import { fetchSubjects } from '../../services/masterDataService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import FormModal from '../../components/FormModal';
import { getErrorMessage } from '../../utils/errors';

function Info({ label, value }) {
  return (
    <div className="col-sm-6">
      <div className="text-muted small">{label}</div>
      <div className="fw-semibold">{value || '-'}</div>
    </div>
  );
}

const fetchAllSubjects = () => fetchSubjects({ limit: 100 });

function AssignSubjectsModal({ teacher, year, assignedIds, onClose, onSaved }) {
  const toast = useToast();
  const { data, loading, error } = useFetch(fetchAllSubjects);
  const [selected, setSelected] = useState(() => new Set(assignedIds));
  const [filter, setFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await assignTeacherSubjects(teacher.id, {
        subjectIds: [...selected],
        academicYearId: year.id,
      });
      toast.success('Subjects assigned successfully');
      onSaved();
    } catch (err) {
      setSaveError(getErrorMessage(err));
      setSaving(false);
    }
  };

  const subjects = (data?.items || []).filter(
    (s) =>
      s.isActive &&
      `${s.code} ${s.name}`.toLowerCase().includes(filter.trim().toLowerCase())
  );

  return (
    <FormModal
      title={`Assign Subjects (${year.name})`}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={saving}
      error={saveError}
      size="modal-lg"
    >
      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <>
          <input
            className="form-control mb-3"
            placeholder="Search subjects..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          {subjects.length === 0 ? (
            <EmptyState icon="bi-book" message="No subjects found" />
          ) : (
            <div className="list-group">
              {subjects.map((s) => (
                <label key={s.id} className="list-group-item d-flex align-items-center gap-3">
                  <input
                    type="checkbox"
                    className="form-check-input m-0"
                    checked={selected.has(s.id)}
                    onChange={() => toggle(s.id)}
                  />
                  <div>
                    <span className="fw-semibold">{s.code}</span> · {s.name}
                    <div className="small text-muted">
                      {s.department.code} · {s.semester.name}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
          <div className="small text-muted mt-2">{selected.size} subject(s) selected</div>
        </>
      )}
    </FormModal>
  );
}

export default function TeacherProfile() {
  const { id } = useParams();
  const lookups = useLookups();
  const fetcher = useCallback(() => fetchTeacher(id), [id]);
  const { data: t, loading, error, reload } = useFetch(fetcher);
  const [showAssign, setShowAssign] = useState(false);

  if (loading || lookups.loading) return <Loader />;
  if (error || lookups.error) {
    return <ErrorMessage message={error || lookups.error} onRetry={reload} />;
  }

  const currentYear = lookups.academicYears.find((y) => y.isCurrent);
  const currentAssignments = currentYear
    ? t.teacherSubjects.filter((a) => a.academicYearId === currentYear.id)
    : [];

  return (
    <>
      <PageHeader title={`${t.firstName} ${t.lastName}`} subtitle={`Employee Code: ${t.employeeCode}`}>
        <Link to="/admin/teachers" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-1" />
          Back
        </Link>
        <Link to={`/admin/teachers/${t.id}/edit`} className="btn btn-primary">
          <i className="bi bi-pencil me-1" />
          Edit
        </Link>
      </PageHeader>

      <div className="row g-3">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-white fw-semibold d-flex justify-content-between">
              Teacher Details <StatusBadge active={t.isActive} />
            </div>
            <div className="card-body">
              <div className="row g-3">
                <Info label="Email" value={t.user.email} />
                <Info label="Phone" value={t.phone} />
                <Info label="Designation" value={t.designation} />
                <Info label="Department" value={t.department.name} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card">
            <div className="card-header bg-white fw-semibold d-flex justify-content-between align-items-center">
              <span>Assigned Subjects {currentYear && `(${currentYear.name})`}</span>
              <button
                className="btn btn-sm btn-primary"
                disabled={!currentYear}
                onClick={() => setShowAssign(true)}
              >
                <i className="bi bi-link-45deg me-1" />
                Assign Subjects
              </button>
            </div>
            <div className="card-body p-0">
              {!currentYear ? (
                <div className="p-3">
                  <div className="alert alert-warning mb-0">
                    No current academic year is set. Set one in Academic Years first.
                  </div>
                </div>
              ) : currentAssignments.length === 0 ? (
                <EmptyState icon="bi-book" message="No subjects assigned yet" />
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Code</th>
                        <th>Subject</th>
                        <th>Department</th>
                        <th>Semester</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentAssignments.map((a) => (
                        <tr key={a.id}>
                          <td className="fw-semibold">{a.subject.code}</td>
                          <td>{a.subject.name}</td>
                          <td>{a.subject.department.code}</td>
                          <td>{a.subject.semester.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAssign && (
        <AssignSubjectsModal
          teacher={t}
          year={currentYear}
          assignedIds={currentAssignments.map((a) => a.subjectId)}
          onClose={() => setShowAssign(false)}
          onSaved={() => {
            setShowAssign(false);
            reload();
          }}
        />
      )}
    </>
  );
}