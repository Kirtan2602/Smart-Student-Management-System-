import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';

// ---------- ADMIN ----------
export const getAdminDashboard = async () => {
  const [
    totalUsers,
    totalStudents,
    activeStudents,
    totalTeachers,
    activeTeachers,
    totalDepartments,
    totalSubjects,
    departments,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.student.count(),
    prisma.student.count({ where: { isActive: true } }),
    prisma.teacher.count(),
    prisma.teacher.count({ where: { isActive: true } }),
    prisma.department.count({ where: { isActive: true } }),
    prisma.subject.count({ where: { isActive: true } }),
    prisma.department.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        _count: { select: { students: true } },
      },
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        action: true,
        entity: true,
        details: true,
        createdAt: true,
        user: { select: { email: true } },
      },
    }),
  ]);

  return {
    counts: {
      totalUsers,
      totalStudents,
      activeStudents,
      totalTeachers,
      activeTeachers,
      totalDepartments,
      totalSubjects,
    },
    studentsByDepartment: departments.map((d) => ({
      name: d.name,
      code: d.code,
      students: d._count.students,
    })),
    recentActivity,
  };
};

// ---------- TEACHER ----------
export const getTeacherDashboard = async (userId) => {
  const teacher = await prisma.teacher.findUnique({
    where: { userId },
    include: { department: { select: { name: true, code: true } } },
  });
  if (!teacher) throw new ApiError(404, 'Teacher profile not found');

  const assignments = await prisma.teacherSubject.findMany({
    where: { teacherId: teacher.id, academicYear: { isCurrent: true } },
    include: {
      academicYear: { select: { name: true } },
      subject: {
        select: {
          id: true,
          code: true,
          name: true,
          semester: { select: { number: true, name: true } },
          _count: { select: { studentSubjects: true } },
        },
      },
    },
    orderBy: { subject: { code: 'asc' } },
  });

  const subjects = assignments.map((a) => ({
    id: a.subject.id,
    code: a.subject.code,
    name: a.subject.name,
    semester: a.subject.semester,
    academicYear: a.academicYear.name,
    enrolledStudents: a.subject._count.studentSubjects,
  }));

  return {
    profile: {
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      employeeCode: teacher.employeeCode,
      designation: teacher.designation,
      department: teacher.department,
    },
    counts: {
      assignedSubjects: subjects.length,
      totalEnrollments: subjects.reduce((sum, s) => sum + s.enrolledStudents, 0),
    },
    subjects,
  };
};

// ---------- STUDENT ----------
export const getStudentDashboard = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      department: { select: { name: true, code: true } },
      semester: { select: { number: true, name: true } },
      academicYear: { select: { name: true } },
      studentSubjects: {
        include: {
          subject: { select: { id: true, code: true, name: true } },
        },
        orderBy: { subject: { code: 'asc' } },
      },
    },
  });
  if (!student) throw new ApiError(404, 'Student profile not found');

  return {
    profile: {
      firstName: student.firstName,
      lastName: student.lastName,
      enrollmentNo: student.enrollmentNo,
      department: student.department,
      semester: student.semester,
      academicYear: student.academicYear,
    },
    counts: { enrolledSubjects: student.studentSubjects.length },
    subjects: student.studentSubjects.map((s) => s.subject),
  };
};