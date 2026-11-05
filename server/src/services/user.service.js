import bcrypt from 'bcrypt';
import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';

const safeUserSelect = {
  id: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

export const createUser = async ({ email, password, role }) => {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { email, passwordHash, role },
    select: safeUserSelect,
  });
};

export const listUsers = async ({ page = 1, limit = 10, role, search }) => {
  const where = {};
  if (role) where.role = role;
  if (search) where.email = { contains: search, mode: 'insensitive' };

  const skip = (page - 1) * limit;

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: safeUserSelect,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const setUserStatus = async (id, isActive, actingUserId) => {
  if (id === actingUserId && isActive === false) {
    throw new ApiError(400, 'You cannot deactivate your own account');
  }

  // Deactivate karvu hoy to teni badhi login sessions pan cancel karo
  const operations = [
    prisma.user.update({
      where: { id },
      data: { isActive },
      select: safeUserSelect,
    }),
  ];

  if (!isActive) {
    operations.push(
      prisma.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      })
    );
  }

  const [user] = await prisma.$transaction(operations);
  return user;
};