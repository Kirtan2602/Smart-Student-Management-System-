import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';

const minPercent = () => Number(process.env.ATTENDANCE_MIN_PERCENT) || 75;
const editDays = () => Number(process.env.ATTENDANCE_EDIT_DAYS) || 7;

// "2026-11-07" -> Date (UTC midnight). Database ma @db.Date column chhe
const toDay = (s) => new Date(`${s}T00:00:00.000Z`);
const todayString = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
const daysBetween = (from, to) => Math.round((toDay(to) - toDay(from)) / 86400000);
const round2 = (n) => Math.round(n * 100) / 100;
const percent = (present, total) => (total > 0 ? round2((present / total) * 100) : null);

const dateRange = (from, to) =>
  from || to
    ? { date: { ...(from && { gte: toDay(from) }), ...(to && { lte: toDay(to) }) } }
    : {};

// ---------- Helpers ----------
const getCurrentYear = async () => {
  const year = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
  if (!year) throw new ApiError(400, 'No current academic year is set. Ask the admin to set one.');
  return year;
};

// Kon chhe? ADMIN ke TEACHER (teacher no profile sathe)
const getActor = async (user) => {
  if (user.role === 'ADMIN') return { isAdmin: true, teacher: null };
  const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } });
  if (!teacher || !teacher.isActive) {
    throw new ApiError(403, 'Teacher profile not found or inactive');
  }
  return { isAdmin: false, teacher };
};

// Teacher fakt potana assigned subject ma j kaam kari shake
const assertSubjectAccess = async (actor, subjectId, year) => {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { id: true, code: true, name: true, isActive: true },
  });
  if (!subject || !subject.isActive) throw new ApiError(404, 'Subject not found');

  if (!actor.isAdmin) {
    const assigned = await prisma.teacherSubject.findUnique({
      where: {
        teacherId_subjectId_academicYearId: {
          teacherId: actor.teacher.id,
          subjectId,
          academicYearId: year.id,
        },
      },
    });
    if (!assigned) throw new ApiError(403, 'You are not assigned to this subject');
  }
  return subject;
};

// Future date badha mate blocked. Teacher mate junu date pan blocked.
const getDateProblem = (actor, date) => {
  const today = todayString();
  if (date > today) {
    return { status: 400, message: 'Attendance cannot be marked for a future date' };
  }
  if (!actor.isAdmin && daysBetween(date, today) > editDays()) {
    return {
      status: 403,
      message: `Teachers can mark or edit attendance only for the last ${editDays()} days. Please contact the admin.`,
    };
  }
  return null;
};

// ---------- Subjects (dropdown mate) ----------
export const getAttendanceSubjects = async (user) => {
  const year = await getCurrentYear();
  const actor = await getActor(user);

  const select = {
    id: true,
    code: true,
    name: true,
    department: { select: { code: true } },
    semester: { select: { number: true, name: true } },
  };

  if (actor.isAdmin) {
    return prisma.subject.findMany({ where: { isActive: true }, select, orderBy: { code: 'asc' } });
  }

  const rows = await prisma.teacherSubject.findMany({
    where: { teacherId: actor.teacher.id, academicYearId: year.id, subject: { isActive: true } },
    select: { subject: { select } },
    orderBy: { subject: { code: 'asc' } },
  });
  return rows.map((r) => r.subject);
};

// ---------- Attendance sheet (enrolled students + jo pehla thi marked hoy) ----------
export const getSheet = async (user, { subjectId, date, lectureNo = 1 }) => {
  const year = await getCurrentYear();
  const actor = await getActor(user);
  const subject = await assertSubjectAccess(actor, subjectId, year);

  const enrollments = await prisma.studentSubject.findMany({
    where: { subjectId, academicYearId: year.id, student: { isActive: true } },
    select: { student: { select: { id: true, enrollmentNo: true, firstName: true, lastName: true } } },
    orderBy: { student: { enrollmentNo: 'asc' } },
  });

  const session = await prisma.attendanceSession.findUnique({
    where: { subjectId_date_lectureNo: { subjectId, date: toDay(date), lectureNo } },
    include: { records: true },
  });

  const statusByStudent = new Map((session?.records || []).map((r) => [r.studentId, r.status]));
  const problem = getDateProblem(actor, date);

  return {
    subject,
    date,
    lectureNo,
    sessionId: session?.id ?? null,
    isExisting: Boolean(session),
    lockedReason: problem?.message ?? null,
    students: enrollments.map(({ student }) => ({
      ...student,
      status: statusByStudent.get(student.id) ?? null,
    })),
  };
};

// ---------- Save (create ke update) ----------
export const saveAttendance = async (user, { subjectId, date, lectureNo = 1, records }) => {
  const year = await getCurrentYear();
  const actor = await getActor(user);
  const subject = await assertSubjectAccess(actor, subjectId, year);

  const problem = getDateProblem(actor, date);
  if (problem) throw new ApiError(problem.status, problem.message);

  const ids = records.map((r) => r.studentId);
  if (new Set(ids).size !== ids.length) {
    throw new ApiError(400, 'A student is listed more than once');
  }

  // Badha students aa subject ma enrolled hovа joie
  const enrolled = await prisma.studentSubject.findMany({
    where: { subjectId, academicYearId: year.id, student: { isActive: true }, studentId: { in: ids } },
    select: { studentId: true },
  });
  if (enrolled.length !== ids.length) {
    throw new ApiError(400, 'One or more students are not enrolled in this subject');
  }

  // Session ma teacher kon? Teacher pote, ane admin hoy to subject no assigned teacher
  let teacherId;
  if (actor.isAdmin) {
    const assignment = await prisma.teacherSubject.findFirst({
      where: { subjectId, academicYearId: year.id },
      select: { teacherId: true },
    });
    if (!assignment) {
      throw new ApiError(400, 'No teacher is assigned to this subject. Assign a teacher first.');
    }
    teacherId = assignment.teacherId;
  } else {
    teacherId = actor.teacher.id;
  }

  const day = toDay(date);

  // Session + badha records: ek transaction ma
  const { session, created } = await prisma.$transaction(
    async (tx) => {
      const existing = await tx.attendanceSession.findUnique({
        where: { subjectId_date_lectureNo: { subjectId, date: day, lectureNo } },
      });

      const current =
        existing ??
        (await tx.attendanceSession.create({
          data: { subjectId, teacherId, academicYearId: year.id, date: day, lectureNo },
        }));

      for (const r of records) {
        await tx.attendanceRecord.upsert({
          where: { sessionId_studentId: { sessionId: current.id, studentId: r.studentId } },
          update: { status: r.status },
          create: { sessionId: current.id, studentId: r.studentId, status: r.status },
        });
      }
      return { session: current, created: !existing };
    },
    { timeout: 20000 }
  );

  const present = records.filter((r) => r.status === 'PRESENT').length;

  return {
    sessionId: session.id,
    created,
    subject,
    present,
    absent: records.length - present,
  };
};

// ---------- History ----------
export const getHistory = async (user, { page = 1, limit = 10, subjectId, from, to }) => {
  const actor = await getActor(user);

  const where = { ...dateRange(from, to) };
  if (subjectId) where.subjectId = subjectId;
  if (!actor.isAdmin) {
    where.subject = { teacherSubjects: { some: { teacherId: actor.teacher.id } } };
  }

  const [items, total] = await prisma.$transaction([
    prisma.attendanceSession.findMany({
      where,
      include: {
        subject: { select: { id: true, code: true, name: true } },
        teacher: { select: { firstName: true, lastName: true } },
      },
      orderBy: [{ date: 'desc' }, { lectureNo: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.attendanceSession.count({ where }),
  ]);

  const counts = items.length
    ? await prisma.attendanceRecord.groupBy({
        by: ['sessionId', 'status'],
        where: { sessionId: { in: items.map((i) => i.id) } },
        _count: { _all: true },
      })
    : [];

  const tally = new Map();
  for (const c of counts) {
    const t = tally.get(c.sessionId) || { present: 0, absent: 0 };
    if (c.status === 'PRESENT') t.present = c._count._all;
    else t.absent = c._count._all;
    tally.set(c.sessionId, t);
  }

  return {
    items: items.map((s) => {
      const t = tally.get(s.id) || { present: 0, absent: 0 };
      return { ...s, present: t.present, absent: t.absent, total: t.present + t.absent };
    }),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ---------- Ek session no detail ----------
export const getSessionDetail = async (user, id) => {
  const actor = await getActor(user);

  const session = await prisma.attendanceSession.findUnique({
    where: { id },
    include: {
      subject: { select: { id: true, code: true, name: true } },
      teacher: { select: { firstName: true, lastName: true } },
      records: {
        include: { student: { select: { id: true, enrollmentNo: true, firstName: true, lastName: true } } },
        orderBy: { student: { enrollmentNo: 'asc' } },
      },
    },
  });
  if (!session) throw new ApiError(404, 'Attendance session not found');

  if (!actor.isAdmin) {
    const teaches = await prisma.teacherSubject.findFirst({
      where: { teacherId: actor.teacher.id, subjectId: session.subjectId },
    });
    if (!teaches) throw new ApiError(403, 'You are not assigned to this subject');
  }
  return session;
};

// ---------- Subject-wise report (student-wise percentage) ----------
export const getSubjectReport = async (user, { subjectId, from, to, threshold }) => {
  const year = await getCurrentYear();
  const actor = await getActor(user);
  const subject = await assertSubjectAccess(actor, subjectId, year);
  const limitPercent = threshold || minPercent();

  const sessionWhere = { subjectId, academicYearId: year.id, ...dateRange(from, to) };

  const [enrollments, grouped, totalSessions] = await Promise.all([
    prisma.studentSubject.findMany({
      where: { subjectId, academicYearId: year.id, student: { isActive: true } },
      select: { student: { select: { id: true, enrollmentNo: true, firstName: true, lastName: true } } },
      orderBy: { student: { enrollmentNo: 'asc' } },
    }),
    prisma.attendanceRecord.groupBy({
      by: ['studentId', 'status'],
      where: { session: sessionWhere },
      _count: { _all: true },
    }),
    prisma.attendanceSession.count({ where: sessionWhere }),
  ]);

  const tally = new Map();
  for (const g of grouped) {
    const t = tally.get(g.studentId) || { present: 0, absent: 0 };
    if (g.status === 'PRESENT') t.present = g._count._all;
    else t.absent = g._count._all;
    tally.set(g.studentId, t);
  }

  const rows = enrollments.map(({ student }) => {
    const t = tally.get(student.id) || { present: 0, absent: 0 };
    const total = t.present + t.absent;
    const pct = percent(t.present, total);
    return {
      ...student,
      present: t.present,
      absent: t.absent,
      total,
      percentage: pct,
      isLow: pct !== null && pct < limitPercent,
    };
  });

  return {
    subject,
    academicYear: year.name,
    threshold: limitPercent,
    totalSessions,
    lowCount: rows.filter((r) => r.isLow).length,
    rows,
  };
};

// ---------- Student summary (subject-wise + overall) ----------
const buildStudentSummary = async (studentId, year, allowedSubjectIds = null) => {
  const enrollments = await prisma.studentSubject.findMany({
    where: {
      studentId,
      academicYearId: year.id,
      ...(allowedSubjectIds && { subjectId: { in: allowedSubjectIds } }),
    },
    select: { subject: { select: { id: true, code: true, name: true } } },
    orderBy: { subject: { code: 'asc' } },
  });

  const records = await prisma.attendanceRecord.findMany({
    where: { studentId, session: { academicYearId: year.id } },
    select: { status: true, session: { select: { subjectId: true } } },
  });

  const tally = new Map();
  for (const r of records) {
    const t = tally.get(r.session.subjectId) || { present: 0, absent: 0 };
    if (r.status === 'PRESENT') t.present += 1;
    else t.absent += 1;
    tally.set(r.session.subjectId, t);
  }

  const threshold = minPercent();
  const subjects = enrollments.map(({ subject }) => {
    const t = tally.get(subject.id) || { present: 0, absent: 0 };
    const total = t.present + t.absent;
    const pct = percent(t.present, total);
    return {
      subjectId: subject.id,
      code: subject.code,
      name: subject.name,
      present: t.present,
      absent: t.absent,
      total,
      percentage: pct,
      isLow: pct !== null && pct < threshold,
    };
  });

  const present = subjects.reduce((sum, s) => sum + s.present, 0);
  const total = subjects.reduce((sum, s) => sum + s.total, 0);
  const overallPct = percent(present, total);

  return {
    threshold,
    academicYear: year.name,
    overall: { present, total, percentage: overallPct, isLow: overallPct !== null && overallPct < threshold },
    subjects,
  };
};

// Admin / Teacher: kono pan student no summary (teacher ne fakt potana subjects)
export const getStudentSummaryForStaff = async (user, studentId) => {
  const year = await getCurrentYear();
  const actor = await getActor(user);

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true, enrollmentNo: true, firstName: true, lastName: true },
  });
  if (!student) throw new ApiError(404, 'Student not found');

  let allowed = null;
  if (!actor.isAdmin) {
    const rows = await prisma.teacherSubject.findMany({
      where: { teacherId: actor.teacher.id, academicYearId: year.id },
      select: { subjectId: true },
    });
    allowed = rows.map((r) => r.subjectId);
  }

  const summary = await buildStudentSummary(studentId, year, allowed);
  if (!actor.isAdmin && summary.subjects.length === 0) {
    throw new ApiError(403, 'This student is not enrolled in any of your subjects');
  }
  return { student, ...summary };
};

// Student: fakt potani attendance (user id token mathi aave chhe, URL ma nahi)
export const getMyAttendance = async (user, { page = 1, limit = 10, subjectId, from, to }) => {
  const student = await prisma.student.findUnique({ where: { userId: user.id } });
  if (!student) throw new ApiError(404, 'Student profile not found');

  const year = await getCurrentYear();
  const summary = await buildStudentSummary(student.id, year);

  const where = {
    studentId: student.id,
    session: { ...(subjectId && { subjectId }), ...dateRange(from, to) },
  };

  const [history, total] = await prisma.$transaction([
    prisma.attendanceRecord.findMany({
      where,
      select: {
        id: true,
        status: true,
        session: {
          select: {
            date: true,
            lectureNo: true,
            subject: { select: { code: true, name: true } },
          },
        },
      },
      orderBy: [{ session: { date: 'desc' } }, { session: { lectureNo: 'desc' } }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.attendanceRecord.count({ where }),
  ]);

  return {
    summary,
    history,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};