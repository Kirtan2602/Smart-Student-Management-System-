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

// 'path' hoy to link chalse, nahi to "Soon". 'end' = fakt exact URL par active
export const MENU_BY_ROLE = {
  ADMIN: [
    { label: 'Dashboard', icon: 'bi-speedometer2', path: '/admin', end: true },
    { label: 'Students', icon: 'bi-people', path: '/admin/students' },
    { label: 'Teachers', icon: 'bi-person-badge', path: '/admin/teachers' },
    { label: 'Departments', icon: 'bi-building', path: '/admin/departments' },
    { label: 'Semesters', icon: 'bi-layers', path: '/admin/semesters' },
    { label: 'Academic Years', icon: 'bi-calendar3', path: '/admin/academic-years' },
    { label: 'Subjects', icon: 'bi-book', path: '/admin/subjects' },
    { label: 'Attendance', icon: 'bi-calendar-check', phase: 'Phase 7' },
    { label: 'Exams & Marks', icon: 'bi-journal-text', phase: 'Phase 8' },
    { label: 'Reports', icon: 'bi-bar-chart-line', phase: 'Phase 9' },
  ],
  TEACHER: [
    { label: 'Dashboard', icon: 'bi-speedometer2', path: '/teacher', end: true },
    { label: 'Attendance', icon: 'bi-calendar-check', phase: 'Phase 7' },
    { label: 'Marks', icon: 'bi-journal-text', phase: 'Phase 8' },
    { label: 'Reports', icon: 'bi-bar-chart-line', phase: 'Phase 9' },
  ],
  STUDENT: [
    { label: 'Dashboard', icon: 'bi-speedometer2', path: '/student', end: true },
    { label: 'My Attendance', icon: 'bi-calendar-check', phase: 'Phase 7' },
    { label: 'My Results', icon: 'bi-journal-text', phase: 'Phase 8' },
    { label: 'My Reports', icon: 'bi-file-earmark-pdf', phase: 'Phase 9' },
  ],
};