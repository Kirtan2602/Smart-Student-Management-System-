import useFetch from '../../hooks/useFetch';
import { downloadFile, fetchOverview } from '../../services/reportService';
import PageHeader from '../../components/PageHeader';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StatCard from '../../components/StatCard';
import ExportButtons from '../../components/ExportButtons';
import BarChart from '../../components/charts/BarChart';
import DoughnutChart from '../../components/charts/DoughnutChart';

const show = (v) => (v === null || v === undefined ? 'N/A' : `${v}%`);

export default function ReportsOverview() {
  const { data, loading, error, reload } = useFetch(fetchOverview);

  if (error) return <ErrorMessage message={error} onRetry={reload} />;
  if (loading || !data) return <Loader />;

  const { students, teachers, attendance, marks, byDepartment, semesterWise, gradeDistribution } = data;
  const grades = gradeDistribution.filter((g) => g.count > 0);
  const semLabels = semesterWise.map((s) => `Sem ${s.number}`);

  return (
    <>
      <PageHeader title="Reports & Analytics" subtitle={`Academic Year ${data.academicYear}`}>
        <ExportButtons
          onDownload={(format) =>
            downloadFile('/reports/students/export', { format }, `students-list.${format}`)
          }
        />
      </PageHeader>

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-4">
          <StatCard
            title="Students"
            value={students.total}
            icon="bi-people-fill"
            color="primary"
            subtitle={`${students.active} active · ${students.inactive} inactive`}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-4">
          <StatCard
            title="Teachers"
            value={teachers.total}
            icon="bi-person-badge-fill"
            color="success"
            subtitle={`${teachers.active} active · ${teachers.inactive} inactive`}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-4">
          <StatCard
            title="Overall Attendance"
            value={show(attendance.overall)}
            icon="bi-calendar-check-fill"
            color="info"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-4">
          <StatCard
            title={`Students below ${data.threshold}% attendance`}
            value={attendance.lowStudents}
            icon="bi-exclamation-triangle-fill"
            color="danger"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-4">
          <StatCard
            title="Published Exams"
            value={marks.publishedExams}
            icon="bi-journal-text"
            color="warning"
            subtitle={`${marks.entries} marks entries · avg ${show(marks.averagePercentage)}`}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-4">
          <StatCard
            title="Exam Pass Rate"
            value={show(marks.passPercentage)}
            icon="bi-award-fill"
            color="success"
          />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-xl-6">
          <div className="card h-100">
            <div className="card-header bg-white fw-semibold">Students by Department</div>
            <div className="card-body">
              {byDepartment.length === 0 ? (
                <EmptyState icon="bi-bar-chart" message="No departments yet" />
              ) : (
                <BarChart labels={byDepartment.map((d) => d.code)} datasets={[{ label: 'Students', data: byDepartment.map((d) => d.students) }]} />
              )}
            </div>
          </div>
        </div>
        <div className="col-12 col-xl-6">
          <div className="card h-100">
            <div className="card-header bg-white fw-semibold">Semester-wise Attendance %</div>
            <div className="card-body">
              <BarChart
                labels={semLabels}
                datasets={[{ label: 'Attendance', data: semesterWise.map((s) => s.attendancePercentage), color: '#0e9f6e' }]}
                max={100}
                unit="%"
              />
            </div>
          </div>
        </div>
        <div className="col-12 col-xl-6">
          <div className="card h-100">
            <div className="card-header bg-white fw-semibold">Semester-wise Marks (published exams)</div>
            <div className="card-body">
              <BarChart
                labels={semLabels}
                datasets={[
                  { label: 'Average %', data: semesterWise.map((s) => s.averagePercentage) },
                  { label: 'Pass %', data: semesterWise.map((s) => s.passPercentage), color: '#f59e0b' },
                ]}
                max={100}
                unit="%"
              />
            </div>
          </div>
        </div>
        <div className="col-12 col-xl-6">
          <div className="card h-100">
            <div className="card-header bg-white fw-semibold">Grade Distribution</div>
            <div className="card-body">
              {grades.length === 0 ? (
                <EmptyState icon="bi-pie-chart" message="No published marks yet" />
              ) : (
                <DoughnutChart labels={grades.map((g) => g.grade)} data={grades.map((g) => g.count)} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-white fw-semibold">Semester-wise Statistics</div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Semester</th>
                <th className="text-center">Students</th>
                <th className="text-center">Subjects</th>
                <th className="text-center">Attendance</th>
                <th className="text-center">Marks Entries</th>
                <th className="text-center">Avg Marks</th>
                <th className="text-center">Pass Rate</th>
              </tr>
            </thead>
            <tbody>
              {semesterWise.map((s) => (
                <tr key={s.semesterId}>
                  <td className="fw-semibold">{s.name}</td>
                  <td className="text-center">{s.students}</td>
                  <td className="text-center">{s.subjects}</td>
                  <td className="text-center">{show(s.attendancePercentage)}</td>
                  <td className="text-center">{s.marksEntries}</td>
                  <td className="text-center">{show(s.averagePercentage)}</td>
                  <td className="text-center">{show(s.passPercentage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}