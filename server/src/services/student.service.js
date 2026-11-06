import bcrypt from 'bcrypt';
import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';

const studentInclude = {
  user: { select: { id: true, email: true, isActive: true } },
  department: { select: { id: true, name: true, code: true } },
  semester: { select: { id: true, number: true, name: true } },
  academicYear: { select: { id: true, name: true } },
};

const toDate = (value) => (value ? new Date(value) : null);

// Student ne tena department + semester na badha active subjects ma enroll karo
const enrollInSubjects = async (tx, student) => {
  const subjects = await tx.subject.findMany({
    where: {
      departmentId: student.departmentId,
      semesterId: student.semesterId,
      isActive: true,
    },
    select: { id: true },
  });
  if (subjects.length === 0) return;

  await tx.studentSubject.createMany({
    data: subjects.map((s) => ({
      studentId: student.id,
      subjectId: s.id,
      academicYearId: student.academicYearId,
    })),
    skipDuplicates: true,
  });
};

export const getAllStudents = async ({
  page = 1,
  limit = 10,
  search,
  departmentId,
  semesterId,
  academicYearId,
  isActive,
}) => {
  const where = {};

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { enrollmentNo: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }
  if (departmentId) where.departmentId = departmentId;
  if (semesterId) where.semesterId = semesterId;
  if (academicYearId) where.academicYearId = academicYearId;
  if (isActive !== undefined) where.isActive = isActive;

  const [items, total] = await prisma.$transaction([
    prisma.student.findMany({
      where,
      include: studentInclude,
      orderBy: { enrollmentNo: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.student.count({ where }),
  ]);

  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getStudentById = async (id) => {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      ...studentInclude,
      studentSubjects: {
        include: {
          subject: { select: { id: true, code: true, name: true } },
          academicYear: { select: { id: true, name: true } },
        },
        orderBy: { subject: { code: 'asc' } },
      },
    },
  });
  if (!student) throw new ApiError(404, 'Student not found');
  return student;
};

export const createStudent = async (data) => {
  const { email, password, enrollmentNo, firstName, lastName, phone, gender,
    dateOfBirth, address, departmentId, semesterId, academicYearId } = data;

  const passwordHash = await bcrypt.hash(password, 10);

  // User + Student + Enrollment: badhu ek sathe, athva kai nahi
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email, passwordHash, role: 'STUDENT' },
    });

    const student = await tx.student.create({
      data: {
        userId: user.id,
        enrollmentNo,
        firstName,
        lastName,
        phone: phone || null,
        gender: gender || null,
        dateOfBirth: toDate(dateOfBirth),
        address: address || null,
        departmentId,
        semesterId,
        academicYearId,
      },
      include: studentInclude,
    });

    await enrollInSubjects(tx, student);
    return student;
  });
};

export const updateStudent = async (id, data) => {
  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Student not found');

  const { email, enrollmentNo, firstName, lastName, phone, gender,
    dateOfBirth, address, departmentId, semesterId, academicYearId } = data;

  return prisma.$transaction(async (tx) => {
    if (email !== undefined) {
      await tx.user.update({ where: { id: existing.userId }, data: { email } });
    }

    const student = await tx.student.update({
      where: { id },
      data: {
        ...(enrollmentNo !== undefined && { enrollmentNo }),
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(gender !== undefined && { gender: gender || null }),
        ...(dateOfBirth !== undefined && { dateOfBirth: toDate(dateOfBirth) }),
        ...(address !== undefined && { address: address || null }),
        ...(departmentId !== undefined && { departmentId }),
        ...(semesterId !== undefined && { semesterId }),
        ...(academicYearId !== undefined && { academicYearId }),
      },
      include: studentInclude,
    });

    // Department/semester/year badlay to navi class na subjects ma enroll karo
    // (juna enrollments history tarike rahe chhe)
    const changed =
      student.departmentId !== existing.departmentId ||
      student.semesterId !== existing.semesterId ||
      student.academicYearId !== existing.academicYearId;
    if (changed) await enrollInSubjects(tx, student);

    return student;
  });
};

export const setStudentStatus = async (id, isActive) => {
  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Student not found');

  const operations = [
    prisma.student.update({ where: { id }, data: { isActive }, include: studentInclude }),
    prisma.user.update({ where: { id: existing.userId }, data: { isActive } }),
  ];
  // Deactivate thay to badhi login sessions cancel
  if (!isActive) {
    operations.push(
      prisma.refreshToken.updateMany({
        where: { userId: existing.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      })
    );
  }

  const [student] = await prisma.$transaction(operations);
  return student;
};