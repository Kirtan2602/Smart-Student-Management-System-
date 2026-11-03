import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';

const subjectInclude = {
  department: { select: { id: true, name: true, code: true } },
  semester: { select: { id: true, number: true, name: true } },
};

export const getAllSubjects = async ({
  page = 1,
  limit = 10,
  search,
  departmentId,
  semesterId,
}) => {
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (departmentId) where.departmentId = departmentId;
  if (semesterId) where.semesterId = semesterId;

  const skip = (page - 1) * limit;

  // Data ane total count ek sathe
  const [items, total] = await prisma.$transaction([
    prisma.subject.findMany({
      where,
      include: subjectInclude,
      orderBy: { code: 'asc' },
      skip,
      take: limit,
    }),
    prisma.subject.count({ where }),
  ]);

  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getSubjectById = async (id) => {
  const subject = await prisma.subject.findUnique({
    where: { id },
    include: subjectInclude,
  });

  if (!subject) throw new ApiError(404, 'Subject not found');
  return subject;
};

export const createSubject = async ({ code, name, departmentId, semesterId }) => {
  return prisma.subject.create({
    data: { code, name, departmentId, semesterId },
    include: subjectInclude,
  });
};

export const updateSubject = async (id, data) => {
  const { code, name, departmentId, semesterId, isActive } = data;
  return prisma.subject.update({
    where: { id },
    data: {
      ...(code !== undefined && { code }),
      ...(name !== undefined && { name }),
      ...(departmentId !== undefined && { departmentId }),
      ...(semesterId !== undefined && { semesterId }),
      ...(isActive !== undefined && { isActive }),
    },
    include: subjectInclude,
  });
};

export const deleteSubject = async (id) => {
  return prisma.subject.delete({ where: { id } });
};