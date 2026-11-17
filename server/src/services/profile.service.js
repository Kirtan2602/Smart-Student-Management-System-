import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';

// passwordHash kyarey aama nathi
export const getMyProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      student: {
        select: {
          id: true,
          enrollmentNo: true,
          firstName: true,
          lastName: true,
          phone: true,
          gender: true,
          dateOfBirth: true,
          address: true,
          department: { select: { name: true, code: true } },
          semester: { select: { name: true } },
          academicYear: { select: { name: true } },
        },
      },
      teacher: {
        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
          phone: true,
          designation: true,
          department: { select: { name: true, code: true } },
        },
      },
    },
  });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

// Email, enrollment no, department vagere fakt admin badli shake (Student/Teacher management ma)
export const updateMyProfile = async (user, { firstName, lastName, phone, address }) => {
  if (user.role === 'ADMIN') {
    throw new ApiError(400, 'The admin account has no profile details to edit');
  }

  const common = {
    ...(firstName !== undefined && { firstName }),
    ...(lastName !== undefined && { lastName }),
    ...(phone !== undefined && { phone: phone || null }),
  };

  if (user.role === 'STUDENT') {
    await prisma.student.update({
      where: { userId: user.id },
      data: { ...common, ...(address !== undefined && { address: address || null }) },
    });
  } else {
    await prisma.teacher.update({ where: { userId: user.id }, data: common });
  }

  return getMyProfile(user.id);
};