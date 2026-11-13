import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import { getCurrentYear, getActor, assertTeachesSubject } from './access.service.js';
import { getGradeRules, gradeFor } from './grade.service.js';
import { pct, round2, sum } from '../utils/grading.js';

const defaultPassPercent = () => Number(process.env.DEFAULT_PASS_PERCENT) || 35;

const examInclude = {
  subject: {
    select: {
      id: true,
      code: true,
      name: true,
      department: { select: { code: true } },
      semester: { select: { number: true, name: true } },
    },
  },
  academicYear: { select: { id: true, name: true } },
};

const getExam = async (id) => {
  const exam = await prisma.exam.findUnique({ where: { id }, include: examInclude });
  if (!exam) throw new ApiError(404, 'Exam not found');
  return exam;
};

// Published exam ma fakt admin badlav kari shake
const assertCanChange = (actor, exam) => {
  if (!actor.isAdmin && exam.isPublished) {
    throw new ApiError(403, 'Results are published. Only the admin can change this exam or its marks.');
  }
};

// ---------- List ----------
export const listExams = async (
  user,
  { page = 1, limit = 10, subjectId, type, academicYearId, isPublished, search }
) => {
  const actor = await getActor(user);

  const where = {};
  if (subjectId) where.subjectId = subjectId;
  if (type) where.type = type;
  if (academicYearId) where.academicYearId = academicYearId;
  if (isPublished !== undefined) where.isPublished = isPublished;
  if (search) where.name = { contains: search, mode: 'insensitive' };
  if (!actor.isAdmin) {
    where.subject = { teacherSubjects: { some: { teacherId: actor.teacher.id } } };
  }

  const [items, total] = await prisma.$transaction([
    prisma.exam.findMany({
      where,
      include: { ...examInclude, _count: { select: { marks: true } } },
      orderBy: [{ createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.exam.count({ where }),
  ]);

  // Darek exam mate ketla students enrolled chhe
  const withEnrolled = await Promise.all(
    items.map(async (exam) => ({
      ...exam,
      enrolled: await prisma.studentSubject.count({
        where: {
          subjectId: exam.subjectId,
          academicYearId: exam.academicYearId,
          student: { isActive: true },
        },
      }),
    }))
  );

  return {
    items: withEnrolled,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getExamById = async (user, id) => {
  const actor = await getActor(user);
  const exam = await getExam(id);
  await assertTeachesSubject(actor, exam.subjectId, exam.academicYearId);
  return exam;
};

// ---------- Create ----------
export const createExam = async (user, data) => {
  const actor = await getActor(user);
  const year = await getCurrentYear();

  const subject = await prisma.subject.findUnique({ where: { id: data.subjectId } });
  if (!subject || !subject.isActive) throw new ApiError(404, 'Subject not found');
  await assertTeachesSubject(actor, subject.id, year.id);

  // Passing marks na aapya hoy to default percentage thi
  const passingMarks =
    data.passingMarks ?? Math.ceil((data.maxMarks * defaultPassPercent()) / 100);
  if (passingMarks > data.maxMarks) {
    throw new ApiError(400, 'Passing marks cannot exceed maximum marks');
  }

  return prisma.exam.create({
    data: {
      name: data.name,
      type: data.type,
      subjectId: subject.id,
      academicYearId: year.id,
      maxMarks: data.maxMarks,
      passingMarks,
      examDate: data.examDate ? new Date(data.examDate) : null,
    },
    include: examInclude,
  });
};

// ---------- Update ----------
export const updateExam = async (user, id, data) => {
  const actor = await getActor(user);
  const exam = await getExam(id);
  await assertTeachesSubject(actor, exam.subjectId, exam.academicYearId);
  assertCanChange(actor, exam);

  const maxMarks = data.maxMarks ?? exam.maxMarks;
  const passingMarks = data.passingMarks ?? exam.passingMarks;
  if (passingMarks > maxMarks) {
    throw new ApiError(400, 'Passing marks cannot exceed maximum marks');
  }

  // Maximum marks ghatadvu hoy to koi student na marks navi limit thi vadhare na hova joie
  if (data.maxMarks !== undefined && data.maxMarks < exam.maxMarks) {
    const top = await prisma.marks.aggregate({
      where: { examId: id },
      _max: { obtainedMarks: true },
    });
    if (top._max.obtainedMarks !== null && Number(top._max.obtainedMarks) > maxMarks) {
      throw new ApiError(
        400,
        `Some students already have marks above ${maxMarks}. Correct those marks first.`
      );
    }
  }

  return prisma.exam.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.type !== undefined && { type: data.type }),
      maxMarks,
      passingMarks,
      ...(data.examDate !== undefined && {
        examDate: data.examDate ? new Date(data.examDate) : null,
      }),
    },
    include: examInclude,
  });
};

// ---------- Delete ----------
export const deleteExam = async (user, id) => {
  const actor = await getActor(user);
  const exam = await getExam(id);
  await assertTeachesSubject(actor, exam.subjectId, exam.academicYearId);
  assertCanChange(actor, exam);

  const marksCount = await prisma.marks.count({ where: { examId: id } });
  if (marksCount > 0) {
    throw new ApiError(409, 'Marks are already entered for this exam, so it cannot be deleted');
  }

  await prisma.exam.delete({ where: { id } });
  return exam;
};

// ---------- Publish / Unpublish ----------
export const setPublished = async (user, id, isPublished) => {
  const actor = await getActor(user);
  const exam = await getExam(id);
  await assertTeachesSubject(actor, exam.subjectId, exam.academicYearId);

  if (!isPublished && !actor.isAdmin) {
    throw new ApiError(403, 'Only the admin can unpublish results');
  }

  if (isPublished) {
    const marksCount = await prisma.marks.count({ where: { examId: id } });
    if (marksCount === 0) throw new ApiError(400, 'Enter marks before publishing results');
  }

  return prisma.exam.update({ where: { id }, data: { isPublished }, include: examInclude });
};

// ---------- Marks sheet ----------
export const getMarksSheet = async (user, id) => {
  const actor = await getActor(user);
  const exam = await getExam(id);
  await assertTeachesSubject(actor, exam.subjectId, exam.academicYearId);
  const rules = await getGradeRules();

  const [enrollments, marks] = await Promise.all([
    prisma.studentSubject.findMany({
      where: {
        subjectId: exam.subjectId,
        academicYearId: exam.academicYearId,
        student: { isActive: true },
      },
      select: {
        student: { select: { id: true, enrollmentNo: true, firstName: true, lastName: true } },
      },
      orderBy: { student: { enrollmentNo: 'asc' } },
    }),
    prisma.marks.findMany({ where: { examId: id } }),
  ]);

  const markByStudent = new Map(marks.map((m) => [m.studentId, Number(m.obtainedMarks)]));

  const rows = enrollments.map(({ student }) => {
    const obtained = markByStudent.has(student.id) ? markByStudent.get(student.id) : null;
    const percentage = obtained === null ? null : pct(obtained, exam.maxMarks);
    return {
      student,
      obtainedMarks: obtained,
      percentage,
      grade: gradeFor(percentage, rules)?.grade ?? null,
      result: obtained === null ? null : obtained >= exam.passingMarks ? 'PASS' : 'FAIL',
    };
  });

  const entered = rows.filter((r) => r.obtainedMarks !== null);
  const values = entered.map((r) => r.obtainedMarks);
  const passCount = entered.filter((r) => r.result === 'PASS').length;

  return {
    exam,
    rows,
    stats: {
      enrolled: rows.length,
      entered: entered.length,
      passCount,
      failCount: entered.length - passCount,
      passPercentage: entered.length ? round2((passCount / entered.length) * 100) : null,
      average: values.length ? round2(sum(values) / values.length) : null,
      highest: values.length ? Math.max(...values) : null,
      lowest: values.length ? Math.min(...values) : null,
    },
    lockedReason:
      exam.isPublished && !actor.isAdmin
        ? 'Results are published. Only the admin can edit marks.'
        : null,
  };
};

// ---------- Save marks ----------
export const saveMarks = async (user, id, marks) => {
  const actor = await getActor(user);
  const exam = await getExam(id);
  await assertTeachesSubject(actor, exam.subjectId, exam.academicYearId);
  assertCanChange(actor, exam);

  const ids = marks.map((m) => m.studentId);
  if (new Set(ids).size !== ids.length) {
    throw new ApiError(400, 'A student is listed more than once');
  }

  // Badha students aa subject ma enrolled hova joie
  const enrolled = await prisma.studentSubject.findMany({
    where: {
      subjectId: exam.subjectId,
      academicYearId: exam.academicYearId,
      student: { isActive: true },
      studentId: { in: ids },
    },
    select: { student: { select: { id: true, enrollmentNo: true } } },
  });
  if (enrolled.length !== ids.length) {
    throw new ApiError(400, 'One or more students are not enrolled in this subject');
  }

  // Marks 0 thi max marks vache hova joie
  const enrollmentNo = new Map(enrolled.map((e) => [e.student.id, e.student.enrollmentNo]));
  for (const m of marks) {
    if (m.obtainedMarks < 0 || m.obtainedMarks > exam.maxMarks) {
      throw new ApiError(
        400,
        `Marks of ${enrollmentNo.get(m.studentId)} must be between 0 and ${exam.maxMarks}`
      );
    }
  }

  const existingCount = await prisma.marks.count({
    where: { examId: id, studentId: { in: ids } },
  });

  await prisma.$transaction(
    async (tx) => {
      for (const m of marks) {
        await tx.marks.upsert({
          where: { examId_studentId: { examId: id, studentId: m.studentId } },
          update: { obtainedMarks: m.obtainedMarks },
          create: { examId: id, studentId: m.studentId, obtainedMarks: m.obtainedMarks },
        });
      }
    },
    { timeout: 20000 }
  );

  return {
    exam,
    saved: marks.length,
    updated: existingCount,
    created: marks.length - existingCount,
  };
};