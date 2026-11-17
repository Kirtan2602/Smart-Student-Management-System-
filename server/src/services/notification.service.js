import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import { getCurrentYear } from './access.service.js';
import { pct } from '../utils/grading.js';

const minPercent = () => Number(process.env.ATTENDANCE_MIN_PERCENT) || 75;
const REPEAT_DAYS = 7;

// ---------- User potani notifications ----------
export const listNotifications = async (userId, { page = 1, limit = 10, unreadOnly = false }) => {
  const where = { userId, ...(unreadOnly && { isRead: false }) };

  const [items, total, unread] = await prisma.$transaction([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    items,
    unread,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getUnreadCount = (userId) =>
  prisma.notification.count({ where: { userId, isRead: false } });

// where ma userId hamesha hoy chhe, etle bija ni notification par asar na thay
export const markRead = async (userId, id) => {
  const result = await prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
  if (result.count === 0) throw new ApiError(404, 'Notification not found');
};

export const markAllRead = (userId) =>
  prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });

export const deleteNotification = async (userId, id) => {
  const result = await prisma.notification.deleteMany({ where: { id, userId } });
  if (result.count === 0) throw new ApiError(404, 'Notification not found');
};

// ---------- Low attendance (attendance save thaya pachhi) ----------
export const notifyLowAttendance = async ({ subjectId, studentIds }) => {
  if (!studentIds.length) return 0;

  const year = await getCurrentYear();
  const threshold = minPercent();

  const [subject, groups, students] = await Promise.all([
    prisma.subject.findUnique({ where: { id: subjectId }, select: { code: true, name: true } }),
    prisma.attendanceRecord.groupBy({
      by: ['studentId', 'status'],
      where: { studentId: { in: studentIds }, session: { subjectId, academicYearId: year.id } },
      _count: { _all: true },
    }),
    prisma.student.findMany({
      where: { id: { in: studentIds }, isActive: true },
      select: { id: true, userId: true },
    }),
  ]);
  if (!subject) return 0;

  const tally = new Map();
  for (const g of groups) {
    const t = tally.get(g.studentId) || { present: 0, total: 0 };
    t.total += g._count._all;
    if (g.status === 'PRESENT') t.present += g._count._all;
    tally.set(g.studentId, t);
  }

  const low = [];
  for (const s of students) {
    const t = tally.get(s.id);
    if (!t || t.total === 0) continue;
    const percentage = pct(t.present, t.total);
    if (percentage < threshold) low.push({ userId: s.userId, percentage });
  }
  if (low.length === 0) return 0;

  // Pachhla 7 divas ma te subject mate notification aapi hoy to skip
  const title = `Low attendance: ${subject.code}`;
  const since = new Date(Date.now() - REPEAT_DAYS * 24 * 60 * 60 * 1000);
  const already = await prisma.notification.findMany({
    where: {
      type: 'LOW_ATTENDANCE',
      title,
      createdAt: { gte: since },
      userId: { in: low.map((l) => l.userId) },
    },
    select: { userId: true },
  });
  const skip = new Set(already.map((a) => a.userId));

  const data = low
    .filter((l) => !skip.has(l.userId))
    .map((l) => ({
      userId: l.userId,
      type: 'LOW_ATTENDANCE',
      title,
      message: `Your attendance in ${subject.code} - ${subject.name} is ${l.percentage}%, below the required ${threshold}%. Please attend lectures regularly.`,
    }));

  if (data.length > 0) await prisma.notification.createMany({ data });
  return data.length;
};

// ---------- Result published ----------
export const notifyResultPublished = async (exam) => {
  const rows = await prisma.marks.findMany({
    where: { examId: exam.id, student: { isActive: true } },
    select: { student: { select: { userId: true } } },
  });
  const userIds = [...new Set(rows.map((r) => r.student.userId))];
  if (userIds.length === 0) return 0;

  const title = `Result published: ${exam.name} (${exam.subject.code})`;

  // Fari publish karo to duplicate na jay
  const already = await prisma.notification.findMany({
    where: { type: 'RESULT', title, userId: { in: userIds } },
    select: { userId: true },
  });
  const skip = new Set(already.map((a) => a.userId));

  const data = userIds
    .filter((id) => !skip.has(id))
    .map((userId) => ({
      userId,
      type: 'RESULT',
      title,
      message: `Your marks for "${exam.name}" in ${exam.subject.code} - ${exam.subject.name} are now available. Open My Results to view them.`,
    }));

  if (data.length > 0) await prisma.notification.createMany({ data });
  return data.length;
};