import useFetch from '../hooks/useFetch';
import { fetchStudentDashboard } from '../services/dashboardService';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import AttendanceSummaryCard from '../components/AttendanceSummaryCard';

export default function StudentDashboard() {
  const { data, loading, error, reload } = useFetch(fetchStudentDashboard);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;

  const { profile, counts, subjects } = data;

  return (
    <>
      <h4 className="fw-bold mb-1">
        Welcome, {profile.firstName} {profile.lastName}
      </h4>
      <div className="text-muted mb-3">Enrollment No: {profile.enrollmentNo}</div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <StatCard
            title="Department"
            value={profile.department.code}
            icon="bi-building-fill"
            color="primary"
            subtitle={profile.department.name}
          />
        </div>
        <div className="col-12 col-md-4">
          <StatCard
            title="Current Semester"
            value={profile.semester.number}
            icon="bi-layers-fill"
            color="success"
            subtitle={`Academic Year ${profile.academicYear.name}`}
          />
        </div>
        <div className="col-12 col-md-4">
          <StatCard
            title="Enrolled Subjects"
            value={counts.enrolledSubjects}
            icon="bi-book-fill"
            color="warning"
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <div className="card h-100">
            <div className="card-header bg-white fw-semibold">My Subjects</div>
            <div className="card-body p-0">
              {subjects.length === 0 ? (
                <EmptyState icon="bi-book" message="You are not enrolled in any subject yet" />
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Code</th>
                        <th>Subject</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((s) => (
                        <tr key={s.id}>
                          <td className="fw-semibold">{s.code}</td>
                          <td>{s.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <AttendanceSummaryCard />
        </div>
      </div>
    </>
  );
}