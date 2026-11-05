import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/tokens.js';

// 1) Login check: token valid chhe? user active chhe?
export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required. Please login.');
  }

  const token = header.slice(7);

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    throw new ApiError(
      401,
      err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid token'
    );
  }

  // Database mathi fresh user: role badlay ke deactivate thay to turant asar thay
  const user = await prisma.user.findUnique({
    where: { id: Number(payload.sub) },
    select: { id: true, email: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    throw new ApiError(401, 'Account not found or deactivated');
  }

  req.user = user;
  next();
});

// 2) Role check: authorize('ADMIN') ke authorize('ADMIN', 'TEACHER')
export const authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(403, 'You do not have permission to perform this action')
      );
    }
    next();
  };