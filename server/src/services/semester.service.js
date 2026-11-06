import prisma from '../config/db.js';

export const getAllSemesters = async () =>
  prisma.semester.findMany({ orderBy: { number: 'asc' } });

export const createSemester = async ({ number, name }) =>
  prisma.semester.create({ data: { number, name } });

export const updateSemester = async (id, { number, name }) =>
  prisma.semester.update({
    where: { id },
    data: {
      ...(number !== undefined && { number }),
      ...(name !== undefined && { name }),
    },
  });

export const deleteSemester = async (id) => prisma.semester.delete({ where: { id } });