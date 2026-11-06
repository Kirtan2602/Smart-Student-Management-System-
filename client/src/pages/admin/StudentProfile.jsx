import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { fetchStudent } from '../../services/studentService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/format';

function Info({ label, value }) {
  return (
    <div className="col-sm-6">
      <div className="text-muted small">{label}</div>
      <div className="fw-semibold">{value || '-'}</div>
    </div>
  );
}

export default function StudentProfile() {
  const { id } = useParams();
  const fetcher = useCallback(() => fetchStudent(id), [id]);
  const { data: s, loading, error, reload } = useFetch(fetcher);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;

  return (
    <>
      <PageHeader title={`${s.firstName} ${s.lastName}`} subtitle={`Enrollment No: ${s.enrollmentNo}`}>
        <Link to="/admin/students" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-1" />
          Back
        </Link>
        <Link to={`/admin/students/${s.id}/edit`} className="btn btn-primary">
          <i className="bi bi-pencil me-1" />
          Edit
        </Link>
      </PageHeader>

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-header bg-white fw-semibold d-flex justify-content-between">
              Personal Details <StatusBadge active={s.isActive} />
            </div>
            <div className="card-body">
              <div className="row g-3">
                <Info label="Email" value={s.user.email} />
                <Info label="Phone" value={s.phone} />
                <Info label="Gender" value={s.gender} />
                <Info label="Date of Birth" value={s.dateOfBirth ? formatDate(s.dateOfBirth) : null} />
                <div className="col-12">
                  <Info label="Address" value={s.address} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-header bg-white fw-semibold">Enrollment Details</div>
            <div className="card-body">
              <div className="row g-3">
                <Info label="Department" value={s.department.name} />
                <Info label="Semester" value={s.semester.name} />
                <Info label="Academic Year" value={s.academicYear.name} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card">
            <div className="card-header bg-white fw-semibold">Enrolled Subjects</div>
            <div className="card-body p-0">
              {s.studentSubjects.length === 0 ? (
                <EmptyState icon="bi-book" message="Not enrolled in any subject" />
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Code</th>
                        <th>Subject</th>
                        <th>Academic Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.studentSubjects.map((e) => (
                        <tr key={e.id}>
                          <td className="fw-semibold">{e.subject.code}</td>
                          <td>{e.subject.name}</td>
                          <td>{e.academicYear.name}</td>
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
    </>
  );
}