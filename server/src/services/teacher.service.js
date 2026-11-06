import bcrypt from 'bcrypt';
import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';

const teacherInclude = {
  user: { select: { id: true, email: true, isActive: true } },
  department: { select: { id: true, name: true, code: true } },
};

export const getAllTeachers = async ({ page = 1, limit = 10, search, departmentId, isActive }) => {
  const where = {};

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { employeeCode: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }
  if (departmentId) where.departmentId = departmentId;
  if (isActive !== undefined) where.isActive = isActive;

  const [items, total] = await prisma.$transaction([
    prisma.teacher.findMany({
      where,
      include: { ...teacherInclude, _count: { select: { teacherSubjects: true } } },
      orderBy: { employeeCode: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.teacher.count({ where }),
  ]);

  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getTeacherById = async (id) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      ...teacherInclude,
      teacherSubjects: {
        include: {
          subject: {
            select: {
              id: true,
              code: true,
              name: true,
              semester: { select: { number: true, name: true } },
              department: { select: { code: true } },
            },
          },
          academicYear: { select: { id: true, name: true, isCurrent: true } },
        },
        orderBy: { subject: { code: 'asc' } },
      },
    },
  });
  if (!teacher) throw new ApiError(404, 'Teacher not found');
  return teacher;
};

export const createTeacher = async (data) => {
  const { email, password, employeeCode, firstName, lastName, phone, designation, departmentId } = data;
  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email, passwordHash, role: 'TEACHER' },
    });

    return tx.teacher.create({
      data: {
        userId: user.id,
        employeeCode,
        firstName,
        lastName,
        phone: phone || null,
        designation: designation || null,
        departmentId,
      },
      include: teacherInclude,
    });
  });
};

export const updateTeacher = async (id, data) => {
  const existing = await prisma.teacher.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Teacher not found');

  const { email, employeeCode, firstName, lastName, phone, designation, departmentId } = data;

  return prisma.$transaction(async (tx) => {
    if (email !== undefined) {
      await tx.user.update({ where: { id: existing.userId }, data: { email } });
    }

    return tx.teacher.update({
      where: { id },
      data: {
        ...(employeeCode !== undefined && { employeeCode }),
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(designation !== undefined && { designation: designation || null }),
        ...(departmentId !== undefined && { departmentId }),
      },
      include: teacherInclude,
    });
  });
};

export const setTeacherStatus = async (id, isActive) => {
  const existing = await prisma.teacher.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Teacher not found');

  const operations = [
    prisma.teacher.update({ where: { id }, data: { isActive }, include: teacherInclude }),
    prisma.user.update({ where: { id: existing.userId }, data: { isActive } }),
  ];
  if (!isActive) {
    operations.push(
      prisma.refreshToken.updateMany({
        where: { userId: existing.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      })
    );
  }

  const [teacher] = await prisma.$transaction(operations);
  return teacher;
};

// Teacher na subjects ni puri list (te academic year mate) replace kare chhe
export const assignSubjects = async (teacherId, subjectIds, academicYearId) => {
  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
  if (!teacher) throw new ApiError(404, 'Teacher not found');

  const year = academicYearId
    ? await prisma.academicYear.findUnique({ where: { id: academicYearId } })
    : await prisma.academicYear.findFirst({ where: { isCurrent: true } });
  if (!year) throw new ApiError(400, 'Academic year not found. Create or set a current academic year first.');

  const ids = [...new Set(subjectIds)];

  const validCount = await prisma.subject.count({
    where: { id: { in: ids }, isActive: true },
  });
  if (validCount !== ids.length) {
    throw new ApiError(400, 'One or more subjects are invalid or inactive');
  }

  await prisma.$transaction([
    prisma.teacherSubject.deleteMany({
      where: { teacherId, academicYearId: year.id, subjectId: { notIn: ids } },
    }),
    prisma.teacherSubject.createMany({
      data: ids.map((subjectId) => ({ teacherId, subjectId, academicYearId: year.id })),
      skipDuplicates: true,
    }),
  ]);

  return getTeacherById(teacherId);
};