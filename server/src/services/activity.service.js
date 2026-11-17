import prisma from '../config/db.js';

export const listActivityLogs = async ({ page = 1, limit = 15, action, search, from, to }) => {
  const where = {};

  if (action) where.action = action;
  if (search) {
    where.OR = [
      { details: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }
  if (from || to) {
    where.createdAt = {
      ...(from && { gte: new Date(`${from}T00:00:00`) }),
      ...(to && { lte: new Date(`${to}T23:59:59.999`) }),
    };
  }

  const [items, total, actionRows] = await prisma.$transaction([
    prisma.activityLog.findMany({
      where,
      include: { user: { select: { email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.activityLog.count({ where }),
    // Filter dropdown mate badha unique actions
    prisma.activityLog.findMany({
      distinct: ['action'],
      select: { action: true },
      orderBy: { action: 'asc' },
    }),
  ]);

  return {
    items,
    actions: actionRows.map((a) => a.action),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};