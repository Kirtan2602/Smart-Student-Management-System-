export const ROLE_HOME = {
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student',
};

export const ROLE_LABEL = {
  ADMIN: 'Administrator',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
};

export const MENU_BY_ROLE = {
  ADMIN: [
    { label: 'Dashboard', icon: 'bi-speedometer2', path: '/admin', end: true },
    { label: 'Students', icon: 'bi-people', path: '/admin/students' },
    { label: 'Teachers', icon: 'bi-person-badge', path: '/admin/teachers' },
    { label: 'Departments', icon: 'bi-building', path: '/admin/departments' },
    { label: 'Semesters', icon: 'bi-layers', path: '/admin/semesters' },
    { label: 'Academic Years', icon: 'bi-calendar3', path: '/admin/academic-years' },
    { label: 'Subjects', icon: 'bi-book', path: '/admin/subjects' },
    { label: 'Mark Attendance', icon: 'bi-calendar-check', path: '/admin/attendance/mark' },
    { label: 'Attendance History', icon: 'bi-clock-history', path: '/admin/attendance/history' },
    { label: 'Attendance Report', icon: 'bi-clipboard-data', path: '/admin/attendance/report' },
    { label: 'Exams & Marks', icon: 'bi-journal-text', phase: 'Phase 8' },
    { label: 'Reports', icon: 'bi-bar-chart-line', phase: 'Phase 9' },
  ],
  TEACHER: [
    { label: 'Dashboard', icon: 'bi-speedometer2', path: '/teacher', end: true },
    { label: 'Mark Attendance', icon: 'bi-calendar-check', path: '/teacher/attendance/mark' },
    { label: 'Attendance History', icon: 'bi-clock-history', path: '/teacher/attendance/history' },
    { label: 'Attendance Report', icon: 'bi-clipboard-data', path: '/teacher/attendance/report' },
    { label: 'Marks', icon: 'bi-journal-text', phase: 'Phase 8' },
    { label: 'Reports', icon: 'bi-bar-chart-line', phase: 'Phase 9' },
  ],
  STUDENT: [
    { label: 'Dashboard', icon: 'bi-speedometer2', path: '/student', end: true },
    { label: 'My Attendance', icon: 'bi-calendar-check', path: '/student/attendance' },
    { label: 'My Results', icon: 'bi-journal-text', phase: 'Phase 8' },
    { label: 'My Reports', icon: 'bi-file-earmark-pdf', phase: 'Phase 9' },
  ],
};