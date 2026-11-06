import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';

export const getAllAcademicYears = async () =>
  prisma.academicYear.findMany({ orderBy: { startDate: 'desc' } });

export const createAcademicYear = async ({ name, startDate, endDate, isCurrent }) =>
  prisma.$transaction(async (tx) => {
    // Ek j time ma fakt ek "current" year
    if (isCurrent) {
      await tx.academicYear.updateMany({ where: { isCurrent: true }, data: { isCurrent: false } });
    }
    return tx.academicYear.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isCurrent: Boolean(isCurrent),
      },
    });
  });

export const updateAcademicYear = async (id, data) => {
  const existing = await prisma.academicYear.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Academic year not found');

  const start = data.startDate ? new Date(data.startDate) : existing.startDate;
  const end = data.endDate ? new Date(data.endDate) : existing.endDate;
  if (end <= start) throw new ApiError(400, 'End date must be after start date');

  if (data.isCurrent === false && existing.isCurrent) {
    throw new ApiError(400, 'At least one academic year must be current. Set another year as current instead.');
  }

  return prisma.$transaction(async (tx) => {
    if (data.isCurrent === true) {
      await tx.academicYear.updateMany({
        where: { isCurrent: true, NOT: { id } },
        data: { isCurrent: false },
      });
    }
    return tx.academicYear.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        startDate: start,
        endDate: end,
        ...(data.isCurrent !== undefined && { isCurrent: data.isCurrent }),
      },
    });
  });
};

export const deleteAcademicYear = async (id) => {
  const existing = await prisma.academicYear.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Academic year not found');
  if (existing.isCurrent) throw new ApiError(400, 'The current academic year cannot be deleted');
  return prisma.academicYear.delete({ where: { id } });
};