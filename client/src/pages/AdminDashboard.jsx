import useFetch from '../hooks/useFetch';
import { fetchAdminDashboard } from '../services/dashboardService';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import DepartmentChart from '../components/charts/DepartmentChart';
import { formatDateTime } from '../utils/format';

export default function AdminDashboard() {
  const { data, loading, error, reload } = useFetch(fetchAdminDashboard);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;

  const { counts, studentsByDepartment, recentActivity } = data;

  return (
    <>
      <h4 className="fw-bold mb-3">Admin Dashboard</h4>

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Students"
            value={counts.totalStudents}
            icon="bi-people-fill"
            color="primary"
            subtitle={`${counts.activeStudents} active`}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Teachers"
            value={counts.totalTeachers}
            icon="bi-person-badge-fill"
            color="success"
            subtitle={`${counts.activeTeachers} active`}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Departments"
            value={counts.totalDepartments}
            icon="bi-building-fill"
            color="warning"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Subjects"
            value={counts.totalSubjects}
            icon="bi-book-fill"
            color="info"
            subtitle={`${counts.totalUsers} user accounts`}
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-xl-6">
          <div className="card h-100">
            <div className="card-header bg-white fw-semibold">Students by Department</div>
            <div className="card-body">
              {studentsByDepartment.length === 0 ? (
                <EmptyState icon="bi-bar-chart" message="No departments yet" />
              ) : (
                <DepartmentChart data={studentsByDepartment} />
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="card h-100">
            <div className="card-header bg-white fw-semibold">Recent Activity</div>
            <div className="card-body p-0">
              {recentActivity.length === 0 ? (
                <EmptyState icon="bi-clock-history" message="No activity yet" />
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Action</th>
                        <th>User</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivity.map((log) => (
                        <tr key={log.id}>
                          <td>
                            <span className="badge text-bg-secondary">{log.action}</span>
                          </td>
                          <td className="small">{log.user?.email || '-'}</td>
                          <td className="small text-muted">{formatDateTime(log.createdAt)}</td>
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