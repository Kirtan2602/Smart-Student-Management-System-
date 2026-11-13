import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';

export const getCurrentYear = async () => {
  const year = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
  if (!year) throw new ApiError(400, 'No current academic year is set. Ask the admin to set one.');
  return year;
};

// Kon chhe? ADMIN ke TEACHER (teacher profile sathe)
export const getActor = async (user) => {
  if (user.role === 'ADMIN') return { isAdmin: true, teacher: null };
  const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } });
  if (!teacher || !teacher.isActive) {
    throw new ApiError(403, 'Teacher profile not found or inactive');
  }
  return { isAdmin: false, teacher };
};

// Teacher fakt potana assigned subject ma j kaam kari shake
export const assertTeachesSubject = async (actor, subjectId, academicYearId) => {
  if (actor.isAdmin) return;
  const assigned = await prisma.teacherSubject.findUnique({
    where: {
      teacherId_subjectId_academicYearId: {
        teacherId: actor.teacher.id,
        subjectId,
        academicYearId,
      },
    },
  });
  if (!assigned) throw new ApiError(403, 'You are not assigned to this subject');
};