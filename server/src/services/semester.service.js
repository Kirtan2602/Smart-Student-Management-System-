import prisma from '../config/db.js';

export const getAllSemesters = async () => {
  return prisma.semester.findMany({ orderBy: { number: 'asc' } });
};
