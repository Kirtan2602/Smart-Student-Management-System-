import bcrypt from 'bcrypt';
import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import {
  signAccessToken,
  generateRefreshToken,
  hashToken,
} from '../utils/tokens.js';
import { logActivity } from '../utils/activityLogger.js';

const REFRESH_DAYS = Number(process.env.REFRESH_TOKEN_DAYS) || 7;
export const REFRESH_MAX_AGE_MS = REFRESH_DAYS * 24 * 60 * 60 * 1000;

// User na hoy tyare pan password compare thase, jethi response time thi
// koi email exist kare chhe ke nahi te jani na shake
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', 10);

// passwordHash kyarey aama nathi
const profileSelect = {
  id: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  student: {
    select: { id: true, enrollmentNo: true, firstName: true, lastName: true },
  },
  teacher: {
    select: { id: true, employeeCode: true, firstName: true, lastName: true },
  },
};

// Navo refresh token banavo ane hash database ma save karo
const createRefreshToken = async (userId) => {
  const refreshToken = generateRefreshToken();
  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId,
      expiresAt: new Date(Date.now() + REFRESH_MAX_AGE_MS),
    },
  });
  return refreshToken;
};

export const login = async ({ email, password, ipAddress }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      student: profileSelect.student,
      teacher: profileSelect.teacher,
    },
  });

  const passwordOk = await bcrypt.compare(
    password,
    user ? user.passwordHash : DUMMY_HASH
  );

  // Email galat hoy ke password galat: same message
  if (!user || !passwordOk) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!user.isActive) {
    throw new ApiError(403, 'Your account is deactivated. Contact the administrator.');
  }

  const accessToken = signAccessToken(user);
  const refreshToken = await createRefreshToken(user.id);

  await logActivity({
    userId: user.id,
    action: 'LOGIN',
    entity: 'User',
    entityId: user.id,
    ipAddress,
  });

  const { passwordHash, ...safeUser } = user;
  return { accessToken, refreshToken, user: safeUser };
};

export const refresh = async (rawToken) => {
  if (!rawToken) throw new ApiError(401, 'No session found. Please login.');

  const tokenHash = hashToken(rawToken);

  // Token ne "use thayelo" mark karo (ek j vaar vapray: rotation)
  const claimed = await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    data: { revokedAt: new Date() },
  });

  if (claimed.count === 0) {
    throw new ApiError(401, 'Session expired. Please login again.');
  }

  const record = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  const user = await prisma.user.findUnique({
    where: { id: record.userId },
    select: profileSelect,
  });

  if (!user || !user.isActive) {
    throw new ApiError(401, 'Account not found or deactivated');
  }

  const accessToken = signAccessToken(user);
  const refreshToken = await createRefreshToken(user.id);

  return { accessToken, refreshToken, user };
};

export const logout = async (rawToken, ipAddress) => {
  if (!rawToken) return;

  const tokenHash = hashToken(rawToken);
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!record) return;

  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  await logActivity({
    userId: record.userId,
    action: 'LOGOUT',
    entity: 'User',
    entityId: record.userId,
    ipAddress,
  });
};

export const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: profileSelect,
  });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};