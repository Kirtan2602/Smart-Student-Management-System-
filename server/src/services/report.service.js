import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import { getCurrentYear } from './access.service.js';
import { getGradeRules, gradeFor } from './grade.service.js';
import { getSubjectReport, buildStudentSummary } from './attendance.service.js';
import { getSubjectResults, getResultsForStudent } from './result.service.js';
import { pct, round2, sum } from '../utils/grading.js';

const minPercent = () => Number(process.env.ATTENDANCE_MIN_PERCENT) || 75;

const resolveYear = async (academicYearId) => {
  if (!academicYearId) return getCurrentYear();
  const year = await prisma.academicYear.findUnique({ where: { id: academicYearId } });
  if (!year) throw new ApiError(404, 'Academic year not found');
  return year;
};

// =============== ADMIN OVERVIEW ===============
export const getOverview = async () => {
  const year = await getCurrentYear();
  const rules = await getGradeRules();
  const threshold = minPercent();

  const [
    studentTotal,
    studentActive,
    teacherTotal,
    teacherActive,
    departments,
    semesters,
    studentsByDept,
    studentsBySem,
    subjectsBySem,
    attendanceGroups,
    publishedExams,
    marks,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { isActive: true } }),
    prisma.teacher.count(),
    prisma.teacher.count({ where: { isActive: true } }),
    prisma.department.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true },
    }),
    prisma.semester.findMany({ orderBy: { number: 'asc' } }),
    prisma.student.groupBy({ by: ['departmentId'], where: { isActive: true }, _count: { _all: true } }),
    prisma.student.groupBy({ by: ['semesterId'], where: { isActive: true }, _count: { _all: true } }),
    prisma.subject.groupBy({ by: ['semesterId'], where: { isActive: true }, _count: { _all: true } }),
    prisma.attendanceRecord.groupBy({
      by: ['studentId', 'status'],
      where: { student: { isActive: true }, session: { academicYearId: year.id } },
      _count: { _all: true },
    }),
    prisma.exam.count({ where: { academicYearId: year.id, isPublished: true } }),
    prisma.marks.findMany({
      where: { exam: { academicYearId: year.id, isPublished: true } },
      select: {
        obtainedMarks: true,
        exam: {
          select: {
            maxMarks: true,
            passingMarks: true,
            subject: { select: { semesterId: true } },
          },
        },
      },
    }),
  ]);

  // ----- Attendance: overall ane low attendance students -----
  const perStudent = new Map();
  for (const g of attendanceGroups) {
    const t = perStudent.get(g.studentId) || { present: 0, total: 0 };
    t.total += g._count._all;
    if (g.status === 'PRESENT') t.present += g._count._all;
    perStudent.set(g.studentId, t);
  }
  let presentAll = 0;
  let totalAll = 0;
  let lowStudents = 0;
  for (const t of perStudent.values()) {
    presentAll += t.present;
    totalAll += t.total;
    const p = pct(t.present, t.total);
    if (p !== null && p < threshold) lowStudents += 1;
  }

  // ----- Attendance: semester-wise -----
  const semAttendance = new Map(
    await Promise.all(
      semesters.map(async (s) => {
        const base = { session: { academicYearId: year.id, subject: { semesterId: s.id } } };
        const [present, total] = await Promise.all([
          prisma.attendanceRecord.count({ where: { ...base, status: 'PRESENT' } }),
          prisma.attendanceRecord.count({ where: base }),
        ]);
        return [s.id, pct(present, total)];
      })
    )
  );

  // ----- Marks: grade distribution + semester-wise -----
  const gradeCounts = new Map(rules.map((r) => [r.grade, 0]));
  const semMarks = new Map();
  let pctSum = 0;
  let passCount = 0;

  for (const m of marks) {
    const obtained = Number(m.obtainedMarks);
    const percentage = pct(obtained, m.exam.maxMarks);
    const passed = obtained >= m.exam.passingMarks;

    pctSum += percentage;
    if (passed) passCount += 1;

    const grade = gradeFor(percentage, rules)?.grade;
    if (grade) gradeCounts.set(grade, (gradeCounts.get(grade) || 0) + 1);

    const key = m.exam.subject.semesterId;
    const s = semMarks.get(key) || { n: 0, pctSum: 0, pass: 0 };
    s.n += 1;
    s.pctSum += percentage;
    if (passed) s.pass += 1;
    semMarks.set(key, s);
  }

  const countMap = (rows, key) => new Map(rows.map((r) => [r[key], r._count._all]));
  const deptCount = countMap(studentsByDept, 'departmentId');
  const semStudents = countMap(studentsBySem, 'semesterId');
  const semSubjects = countMap(subjectsBySem, 'semesterId');

  return {
    academicYear: year.name,
    threshold,
    students: { total: studentTotal, active: studentActive, inactive: studentTotal - studentActive },
    teachers: { total: teacherTotal, active: teacherActive, inactive: teacherTotal - teacherActive },
    attendance: { overall: pct(presentAll, totalAll), lowStudents },
    marks: {
      publishedExams,
      entries: marks.length,
      averagePercentage: marks.length ? round2(pctSum / marks.length) : null,
      passPercentage: marks.length ? round2((passCount / marks.length) * 100) : null,
    },
    byDepartment: departments.map((d) => ({
      name: d.name,
      code: d.code,
      students: deptCount.get(d.id) || 0,
    })),
    semesterWise: semesters.map((s) => {
      const m = semMarks.get(s.id);
      return {
        semesterId: s.id,
        number: s.number,
        name: s.name,
        students: semStudents.get(s.id) || 0,
        subjects: semSubjects.get(s.id) || 0,
        attendancePercentage: semAttendance.get(s.id) ?? null,
        marksEntries: m?.n || 0,
        averagePercentage: m ? round2(m.pctSum / m.n) : null,
        passPercentage: m ? round2((m.pass / m.n) * 100) : null,
      };
    }),
    gradeDistribution: [...gradeCounts].map(([grade, count]) => ({ grade, count })),
  };
};

// =============== SUBJECT REPORT (attendance + marks ek sathe) ===============
export const getSubjectCombined = async (user, subjectId, { from, to }) => {
  // Banne functions ma teacher no subject-level permission check pehla thi chhe
  const [attendance, results] = await Promise.all([
    getSubjectReport(user, { subjectId, from, to }),
    getSubjectResults(user, { subjectId }),
  ]);

  const resultByStudent = new Map(results.rows.map((r) => [r.student.id, r.result]));

  const rows = attendance.rows.map((r) => {
    const m = resultByStudent.get(r.id);
    const declared = Boolean(m?.hasResult);
    return {
      ...r,
      marksTotal: declared ? m.total : null,
      marksMax: declared ? m.max : null,
      marksPercentage: declared ? m.percentage : null,
      grade: declared ? m.grade : null,
      result: declared ? m.result : null,
    };
  });

  return {
    subject: attendance.subject,
    academicYear: attendance.academicYear,
    threshold: attendance.threshold,
    totalSessions: attendance.totalSessions,
    lowCount: attendance.lowCount,
    exams: results.exams,
    resultStats: results.stats,
    rows,
  };
};

// =============== STUDENT REPORT (performance analytics) ===============
export const getStudentIdByUser = async (userId) => {
  const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
  if (!student) throw new ApiError(404, 'Student profile not found');
  return student.id;
};

export const getStudentReport = async (studentId, academicYearId) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { email: true } },
      department: { select: { name: true, code: true } },
      semester: { select: { number: true, name: true } },
    },
  });
  if (!student) throw new ApiError(404, 'Student not found');

  const year = await resolveYear(academicYearId);

  const [attendance, results] = await Promise.all([
    buildStudentSummary(student.id, year),
    getResultsForStudent(student.id, year.id),
  ]);

  const attendanceBySubject = new Map(attendance.subjects.map((s) => [s.subjectId, s]));

  const subjects = results.semesters
    .flatMap((g) => g.subjects)
    .map((s) => {
      const a = attendanceBySubject.get(s.subjectId);
      return {
        subjectId: s.subjectId,
        code: s.code,
        name: s.name,
        present: a?.present ?? 0,
        attendanceTotal: a?.total ?? 0,
        attendancePercentage: a?.percentage ?? null,
        attendanceLow: Boolean(a?.isLow),
        hasResult: s.hasResult,
        marksTotal: s.total,
        marksMax: s.max,
        marksPercentage: s.percentage,
        grade: s.grade,
        result: s.result,
      };
    });

  const exams = results.semesters.flatMap((g) =>
    g.subjects.flatMap((s) =>
      s.exams
        .filter((e) => e.obtained !== null)
        .map((e) => ({
          subjectCode: s.code,
          name: e.name,
          type: e.type,
          obtained: e.obtained,
          maxMarks: e.maxMarks,
          percentage: e.percentage,
          grade: e.grade,
          result: e.result,
        }))
    )
  );

  const declared = subjects.filter((s) => s.hasResult);
  const ranked = [...declared].sort((a, b) => b.marksPercentage - a.marksPercentage);
  const pick = (s) => (s ? { code: s.code, name: s.name, percentage: s.marksPercentage } : null);

  return {
    student: {
      id: student.id,
      enrollmentNo: student.enrollmentNo,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.user.email,
      department: student.department,
      semester: student.semester,
    },
    academicYear: year.name,
    threshold: attendance.threshold,
    attendance: attendance.overall,
    semesters: results.semesters.map((g) => ({ semester: g.semester, overall: g.overall })),
    subjects,
    exams,
    insights: {
      bestSubject: pick(ranked[0]),
      // Fakt jyare ek thi vadhare subject no result hoy tyare weakest arthpurn chhe
      weakestSubject: ranked.length > 1 ? pick(ranked[ranked.length - 1]) : null,
      lowAttendanceSubjects: subjects.filter((s) => s.attendanceLow).map((s) => s.code),
      failedSubjects: declared.filter((s) => s.result === 'FAIL').map((s) => s.code),
    },
  };
};

// =============== STUDENTS LIST (export mate) ===============
export const getStudentsForExport = async ({ departmentId, semesterId, isActive }) => {
  const where = {};
  if (departmentId) where.departmentId = departmentId;
  if (semesterId) where.semesterId = semesterId;
  if (isActive !== undefined) where.isActive = isActive;

  return prisma.student.findMany({
    where,
    include: {
      user: { select: { email: true } },
      department: { select: { code: true } },
      semester: { select: { number: true } },
      academicYear: { select: { name: true } },
    },
    orderBy: { enrollmentNo: 'asc' },
  });
};