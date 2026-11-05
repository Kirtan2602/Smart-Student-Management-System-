import useFetch from '../hooks/useFetch';
import { fetchTeacherDashboard } from '../services/dashboardService';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';

export default function TeacherDashboard() {
  const { data, loading, error, reload } = useFetch(fetchTeacherDashboard);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;

  const { profile, counts, subjects } = data;

  return (
    <>
      <h4 className="fw-bold mb-1">
        Welcome, {profile.firstName} {profile.lastName}
      </h4>
      <div className="text-muted mb-3">
        {profile.designation || 'Teacher'} · {profile.department.name} · ID: {profile.employeeCode}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6">
          <StatCard
            title="Assigned Subjects"
            value={counts.assignedSubjects}
            icon="bi-book-fill"
            color="primary"
          />
        </div>
        <div className="col-12 col-sm-6">
          <StatCard
            title="Total Student Enrollments"
            value={counts.totalEnrollments}
            icon="bi-people-fill"
            color="success"
          />
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-white fw-semibold">My Subjects (Current Academic Year)</div>
        <div className="card-body p-0">
          {subjects.length === 0 ? (
            <EmptyState icon="bi-book" message="No subjects assigned to you yet" />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Code</th>
                    <th>Subject</th>
                    <th>Semester</th>
                    <th>Academic Year</th>
                    <th className="text-end">Students</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s) => (
                    <tr key={s.id}>
                      <td className="fw-semibold">{s.code}</td>
                      <td>{s.name}</td>
                      <td>{s.semester.name}</td>
                      <td>{s.academicYear}</td>
                      <td className="text-end">{s.enrolledStudents}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}