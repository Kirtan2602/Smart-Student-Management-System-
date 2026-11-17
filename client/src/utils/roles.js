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
    { label: 'Exams & Marks', icon: 'bi-journal-text', path: '/admin/exams' },
    { label: 'Subject Results', icon: 'bi-table', path: '/admin/results/subject' },
    { label: 'Semester Results', icon: 'bi-award', path: '/admin/results/semester' },
    { label: 'Grade Rules', icon: 'bi-sliders', path: '/admin/grade-rules' },
    { label: 'Reports Overview', icon: 'bi-bar-chart-line', path: '/admin/reports', end: true },
    { label: 'Subject Report', icon: 'bi-file-earmark-bar-graph', path: '/admin/reports/subject' },
    { label: 'Student Report', icon: 'bi-person-lines-fill', path: '/admin/reports/student' },
    { label: 'Activity Logs', icon: 'bi-activity', path: '/admin/activity' },
    { label: 'Notifications', icon: 'bi-bell', path: '/admin/notifications' },
    { label: 'My Profile', icon: 'bi-person-circle', path: '/admin/profile' },
  ],
  TEACHER: [
    { label: 'Dashboard', icon: 'bi-speedometer2', path: '/teacher', end: true },
    { label: 'Mark Attendance', icon: 'bi-calendar-check', path: '/teacher/attendance/mark' },
    { label: 'Attendance History', icon: 'bi-clock-history', path: '/teacher/attendance/history' },
    { label: 'Attendance Report', icon: 'bi-clipboard-data', path: '/teacher/attendance/report' },
    { label: 'Exams & Marks', icon: 'bi-journal-text', path: '/teacher/exams' },
    { label: 'Subject Results', icon: 'bi-table', path: '/teacher/results/subject' },
    { label: 'Subject Report', icon: 'bi-file-earmark-bar-graph', path: '/teacher/reports/subject' },
    { label: 'Notifications', icon: 'bi-bell', path: '/teacher/notifications' },
    { label: 'My Profile', icon: 'bi-person-circle', path: '/teacher/profile' },
  ],
  STUDENT: [
    { label: 'Dashboard', icon: 'bi-speedometer2', path: '/student', end: true },
    { label: 'My Attendance', icon: 'bi-calendar-check', path: '/student/attendance' },
    { label: 'My Results', icon: 'bi-journal-text', path: '/student/results' },
    { label: 'My Reports', icon: 'bi-file-earmark-pdf', path: '/student/reports' },
    { label: 'Notifications', icon: 'bi-bell', path: '/student/notifications' },
    { label: 'My Profile', icon: 'bi-person-circle', path: '/student/profile' },
  ],
};