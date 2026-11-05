// Role pramane kayo dashboard
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

// Sidebar menu. 'path' hoy to link chalse, nahi to "Soon" tarike dekhase
export const MENU_BY_ROLE = {
  ADMIN: [
    { label: 'Dashboard', icon: 'bi-speedometer2', path: '/admin' },
    { label: 'Students', icon: 'bi-people', phase: 'Phase 6' },
    { label: 'Teachers', icon: 'bi-person-badge', phase: 'Phase 6' },
    { label: 'Departments', icon: 'bi-building', phase: 'Phase 6' },
    { label: 'Subjects', icon: 'bi-book', phase: 'Phase 6' },
    { label: 'Attendance', icon: 'bi-calendar-check', phase: 'Phase 7' },
    { label: 'Exams & Marks', icon: 'bi-journal-text', phase: 'Phase 8' },
    { label: 'Reports', icon: 'bi-bar-chart-line', phase: 'Phase 9' },
  ],
  TEACHER: [
    { label: 'Dashboard', icon: 'bi-speedometer2', path: '/teacher' },
    { label: 'Attendance', icon: 'bi-calendar-check', phase: 'Phase 7' },
    { label: 'Marks', icon: 'bi-journal-text', phase: 'Phase 8' },
    { label: 'Reports', icon: 'bi-bar-chart-line', phase: 'Phase 9' },
  ],
  STUDENT: [
    { label: 'Dashboard', icon: 'bi-speedometer2', path: '/student' },
    { label: 'My Attendance', icon: 'bi-calendar-check', phase: 'Phase 7' },
    { label: 'My Results', icon: 'bi-journal-text', phase: 'Phase 8' },
    { label: 'My Reports', icon: 'bi-file-earmark-pdf', phase: 'Phase 9' },
  ],
};