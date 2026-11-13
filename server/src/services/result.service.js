import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import { getCurrentYear, getActor, assertTeachesSubject } from './access.service.js';
import { getGradeRules, gradeFor } from './grade.service.js';
import { pct, round2, sum } from '../utils/grading.js';

const resolveYear = async (academicYearId) => {
  if (!academicYearId) return getCurrentYear();
  const year = await prisma.academicYear.findUnique({ where: { id: academicYearId } });
  if (!year) throw new ApiError(404, 'Academic year not found');
  return year;
};

// ---------- Ek subject no result (teni badhi published exams ma thi) ----------
const summarizeSubject = (subject, examRows, rules) => {
  const base = { subjectId: subject.id, code: subject.code, name: subject.name, exams: examRows };
  const scored = examRows.filter((e) => e.obtained !== null);

  // Haju koi exam ma marks nathi
  if (scored.length === 0) {
    return {
      ...base,
      hasResult: false,
      total: null,
      max: null,
      percentage: null,
      grade: null,
      gradePoint: null,
      result: null,
    };
  }

  const total = round2(sum(scored.map((e) => e.obtained)));
  const max = sum(scored.map((e) => e.maxMarks));
  const passing = sum(scored.map((e) => e.passingMarks));
  const percentage = pct(total, max);
  const rule = gradeFor(percentage, rules);

  return {
    ...base,
    hasResult: true,
    total,
    max,
    percentage,
    grade: rule?.grade ?? null,
    gradePoint: rule?.gradePoint ?? null,
    // Subject pass: total marks >= total passing marks
    result: total >= passing ? 'PASS' : 'FAIL',
  };
};

// ---------- Semester no overall result ----------
const summarizeSemester = (subjects, rules) => {
  const declared = subjects.filter((s) => s.hasResult);
  const failed = declared.filter((s) => s.result === 'FAIL').length;
  const pending = subjects.length - declared.length;

  const total = round2(sum(declared.map((s) => s.total)));
  const max = sum(declared.map((s) => s.max));
  const percentage = pct(total, max);
  const points = declared.map((s) => s.gradePoint).filter((p) => p !== null);

  let result;
  if (declared.length === 0) result = 'NOT_DECLARED';
  else if (failed > 0) result = 'FAIL';
  else if (pending > 0) result = 'INCOMPLETE';
  else result = 'PASS';

  return {
    total,
    max,
    percentage,
    grade: gradeFor(percentage, rules)?.grade ?? null,
    gpa: points.length ? round2(sum(points) / points.length) : null,
    subjectsTotal: subjects.length,
    subjectsDeclared: declared.length,
    pending,
    failed,
    result,
  };
};

// ---------- Main builder: ghana students no result ek sathe ----------
// Fakt PUBLISHED exams ganay chhe.
// Return: Map(studentId -> [{ semester, subjects, overall }])
const buildResults = async (studentIds, academicYearId, rules, { semesterId, subjectId } = {}) => {
  const results = new Map();
  if (studentIds.length === 0) return results;

  const enrollments = await prisma.studentSubject.findMany({
    where: {
      studentId: { in: studentIds },
      academicYearId,
      ...(subjectId && { subjectId }),
      ...(semesterId && { subject: { semesterId } }),
    },
    select: {
      studentId: true,
      subject: {
        select: {
          id: true,
          code: true,
          name: true,
          semester: { select: { id: true, number: true, name: true } },
        },
      },
    },
    orderBy: { subject: { code: 'asc' } },
  });

  const subjectIds = [...new Set(enrollments.map((e) => e.subject.id))];

  const exams = subjectIds.length
    ? await prisma.exam.findMany({
        where: { academicYearId, isPublished: true, subjectId: { in: subjectIds } },
        select: {
          id: true,
          name: true,
          type: true,
          subjectId: true,
          maxMarks: true,
          passingMarks: true,
          marks: {
            where: { studentId: { in: studentIds } },
            select: { studentId: true, obtainedMarks: true },
          },
        },
        orderBy: [{ examDate: 'asc' }, { id: 'asc' }],
      })
    : [];

  const examsBySubject = new Map();
  const markIndex = new Map(); // "examId:studentId" -> marks
  for (const exam of exams) {
    if (!examsBySubject.has(exam.subjectId)) examsBySubject.set(exam.subjectId, []);
    examsBySubject.get(exam.subjectId).push(exam);
    for (const m of exam.marks) {
      markIndex.set(`${exam.id}:${m.studentId}`, Number(m.obtainedMarks));
    }
  }

  const grouped = new Map(); // studentId -> Map(semesterId -> { semester, subjects })
  for (const { studentId, subject } of enrollments) {
    const examRows = (examsBySubject.get(subject.id) || []).map((exam) => {
      const obtained = markIndex.get(`${exam.id}:${studentId}`) ?? null;
      const percentage = obtained === null ? null : pct(obtained, exam.maxMarks);
      return {
        examId: exam.id,
        name: exam.name,
        type: exam.type,
        maxMarks: exam.maxMarks,
        passingMarks: exam.passingMarks,
        obtained,
        percentage,
        grade: gradeFor(percentage, rules)?.grade ?? null,
        result: obtained === null ? null : obtained >= exam.passingMarks ? 'PASS' : 'FAIL',
      };
    });

    if (!grouped.has(studentId)) grouped.set(studentId, new Map());
    const semesters = grouped.get(studentId);
    if (!semesters.has(subject.semester.id)) {
      semesters.set(subject.semester.id, { semester: subject.semester, subjects: [] });
    }
    semesters.get(subject.semester.id).subjects.push(summarizeSubject(subject, examRows, rules));
  }

  for (const [studentId, semesters] of grouped) {
    results.set(
      studentId,
      [...semesters.values()]
        .sort((a, b) => a.semester.number - b.semester.number)
        .map((g) => ({ ...g, overall: summarizeSemester(g.subjects, rules) }))
    );
  }
  return results;
};

// ---------- Student: potana results (id token mathi, URL ma nahi) ----------
export const getMyResults = async (user, { academicYearId }) => {
  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    select: { id: true, enrollmentNo: true, firstName: true, lastName: true },
  });
  if (!student) throw new ApiError(404, 'Student profile not found');

  const year = await resolveYear(academicYearId);
  const rules = await getGradeRules();
  const results = await buildResults([student.id], year.id, rules);

  return {
    student,
    academicYear: { id: year.id, name: year.name },
    semesters: results.get(student.id) || [],
  };
};

// ---------- Subject-wise results (Admin + Teacher) ----------
export const getSubjectResults = async (user, { subjectId, academicYearId }) => {
  const actor = await getActor(user);
  const year = await resolveYear(academicYearId);
  await assertTeachesSubject(actor, subjectId, year.id);

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: {
      id: true,
      code: true,
      name: true,
      department: { select: { code: true } },
      semester: { select: { number: true, name: true } },
    },
  });
  if (!subject) throw new ApiError(404, 'Subject not found');

  const rules = await getGradeRules();

  const enrollments = await prisma.studentSubject.findMany({
    where: { subjectId, academicYearId: year.id, student: { isActive: true } },
    select: {
      student: { select: { id: true, enrollmentNo: true, firstName: true, lastName: true } },
    },
    orderBy: { student: { enrollmentNo: 'asc' } },
  });
  const students = enrollments.map((e) => e.student);

  const results = await buildResults(
    students.map((s) => s.id),
    year.id,
    rules,
    { subjectId }
  );

  const rows = students.map((student) => ({
    student,
    result: results.get(student.id)?.[0]?.subjects[0] ?? null,
  }));

  // Exam columns (darek student ni exams ni list same hoy chhe)
  const exams =
    rows[0]?.result?.exams.map((e) => ({
      examId: e.examId,
      name: e.name,
      type: e.type,
      maxMarks: e.maxMarks,
      passingMarks: e.passingMarks,
    })) ?? [];

  const declared = rows.filter((r) => r.result?.hasResult);
  const passCount = declared.filter((r) => r.result.result === 'PASS').length;

  return {
    subject,
    academicYear: year.name,
    exams,
    rows,
    stats: {
      students: rows.length,
      declared: declared.length,
      passCount,
      failCount: declared.length - passCount,
      passPercentage: declared.length ? round2((passCount / declared.length) * 100) : null,
      averagePercentage: declared.length
        ? round2(sum(declared.map((r) => r.result.percentage)) / declared.length)
        : null,
    },
  };
};

// ---------- Semester results (Admin) ----------
export const getSemesterResults = async (user, { semesterId, departmentId, academicYearId }) => {
  const year = await resolveYear(academicYearId);

  const [semester, department] = await Promise.all([
    prisma.semester.findUnique({ where: { id: semesterId } }),
    prisma.department.findUnique({ where: { id: departmentId } }),
  ]);
  if (!semester) throw new ApiError(404, 'Semester not found');
  if (!department) throw new ApiError(404, 'Department not found');

  // Te year ma aa semester na subjects ma enrolled students
  const enrolled = await prisma.studentSubject.findMany({
    where: { academicYearId: year.id, subject: { semesterId, departmentId } },
    select: { studentId: true },
    distinct: ['studentId'],
  });
  const ids = enrolled.map((e) => e.studentId);

  const students = await prisma.student.findMany({
    where: { id: { in: ids } },
    select: { id: true, enrollmentNo: true, firstName: true, lastName: true, isActive: true },
    orderBy: { enrollmentNo: 'asc' },
  });

  const rules = await getGradeRules();
  const results = await buildResults(ids, year.id, rules, { semesterId });

  const rows = students.map((student) => {
    const group = results.get(student.id)?.[0];
    return { student, subjects: group?.subjects ?? [], overall: group?.overall ?? null };
  });

  // Table columns: subjects ni unique list
  const subjectMap = new Map();
  for (const row of rows) {
    for (const s of row.subjects) subjectMap.set(s.subjectId, { id: s.subjectId, code: s.code, name: s.name });
  }
  const subjects = [...subjectMap.values()].sort((a, b) => a.code.localeCompare(b.code));

  const count = (result) => rows.filter((r) => r.overall?.result === result).length;
  const pass = count('PASS');
  const fail = count('FAIL');

  return {
    semester,
    department: { id: department.id, name: department.name, code: department.code },
    academicYear: year.name,
    subjects,
    rows,
    stats: {
      students: rows.length,
      pass,
      fail,
      incomplete: count('INCOMPLETE'),
      notDeclared: count('NOT_DECLARED'),
      passPercentage: pass + fail > 0 ? round2((pass / (pass + fail)) * 100) : null,
    },
  };
};