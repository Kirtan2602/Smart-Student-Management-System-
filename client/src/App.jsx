import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import HomeRedirect from './components/HomeRedirect';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import NotFound from './pages/NotFound';
import StudentList from './pages/admin/StudentList';
import StudentForm from './pages/admin/StudentForm';
import StudentProfile from './pages/admin/StudentProfile';
import TeacherList from './pages/admin/TeacherList';
import TeacherForm from './pages/admin/TeacherForm';
import TeacherProfile from './pages/admin/TeacherProfile';
import DepartmentManager from './pages/admin/DepartmentManager';
import SemesterManager from './pages/admin/SemesterManager';
import AcademicYearManager from './pages/admin/AcademicYearManager';
import SubjectManager from './pages/admin/SubjectManager';
import MarkAttendance from './pages/attendance/MarkAttendance';
import AttendanceHistory from './pages/attendance/AttendanceHistory';
import AttendanceReport from './pages/attendance/AttendanceReport';
import MyAttendance from './pages/student/MyAttendance';
import ExamList from './pages/exams/ExamList';
import MarksEntry from './pages/exams/MarksEntry';
import SubjectResults from './pages/exams/SubjectResults';
import SemesterResults from './pages/exams/SemesterResults';
import GradeRules from './pages/exams/GradeRules';
import MyResults from './pages/student/MyResults';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/admin/students" element={<StudentList />} />
          <Route path="/admin/students/new" element={<StudentForm />} />
          <Route path="/admin/students/:id" element={<StudentProfile />} />
          <Route path="/admin/students/:id/edit" element={<StudentForm />} />

          <Route path="/admin/teachers" element={<TeacherList />} />
          <Route path="/admin/teachers/new" element={<TeacherForm />} />
          <Route path="/admin/teachers/:id" element={<TeacherProfile />} />
          <Route path="/admin/teachers/:id/edit" element={<TeacherForm />} />

          <Route path="/admin/departments" element={<DepartmentManager />} />
          <Route path="/admin/semesters" element={<SemesterManager />} />
          <Route path="/admin/academic-years" element={<AcademicYearManager />} />
          <Route path="/admin/subjects" element={<SubjectManager />} />

          <Route path="/admin/attendance/mark" element={<MarkAttendance />} />
          <Route path="/admin/attendance/history" element={<AttendanceHistory />} />
          <Route path="/admin/attendance/report" element={<AttendanceReport />} />

          <Route path="/admin/exams" element={<ExamList />} />
          <Route path="/admin/exams/:id/marks" element={<MarksEntry />} />
          <Route path="/admin/results/subject" element={<SubjectResults />} />
          <Route path="/admin/results/semester" element={<SemesterResults />} />
          <Route path="/admin/grade-rules" element={<GradeRules />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/teacher" element={<TeacherDashboard />} />

          <Route path="/teacher/attendance/mark" element={<MarkAttendance />} />
          <Route path="/teacher/attendance/history" element={<AttendanceHistory />} />
          <Route path="/teacher/attendance/report" element={<AttendanceReport />} />

          <Route path="/teacher/exams" element={<ExamList />} />
          <Route path="/teacher/exams/:id/marks" element={<MarksEntry />} />
          <Route path="/teacher/results/subject" element={<SubjectResults />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/attendance" element={<MyAttendance />} />
          <Route path="/student/results" element={<MyResults />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}