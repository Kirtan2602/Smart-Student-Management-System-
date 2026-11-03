import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';

export const getAllDepartments = async ({ search, isActive }) => {
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  return prisma.department.findMany({
    where,
    orderBy: { name: 'asc' },
  });
};

export const getDepartmentById = async (id) => {
  const department = await prisma.department.findUnique({
    where: { id },
    include: {
      _count: { select: { students: true, teachers: true, subjects: true } },
    },
  });

  if (!department) throw new ApiError(404, 'Department not found');
  return department;
};

export const createDepartment = async ({ name, code }) => {
  return prisma.department.create({ data: { name, code } });
};

export const updateDepartment = async (id, data) => {
  // Fakt je fields aavya hoy te j update karo
  const { name, code, isActive } = data;
  return prisma.department.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(code !== undefined && { code }),
      ...(isActive !== undefined && { isActive }),
    },
  });
};

export const deleteDepartment = async (id) => {
  return prisma.department.delete({ where: { id } });
};