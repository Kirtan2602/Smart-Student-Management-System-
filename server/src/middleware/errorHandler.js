import ApiError from '../utils/ApiError.js';

// Koi route match na thay tyare 404
export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// Badhi errors ahi j handle thay chhe
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  const details = err.details || undefined;

  // Frontend e galat JSON moklyu
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }
  // Prisma: unique constraint tooti (jem ke duplicate code/email)
  else if (err.code === 'P2002') {
    statusCode = 409;
    const target = Array.isArray(err.meta?.target)
      ? err.meta.target.join(', ')
      : err.meta?.target;
    message = `Duplicate value: ${target} already exists`;
  }
  // Prisma: record malyo nahi (update/delete vakhate)
  else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }
  // Prisma: foreign key problem
  else if (
  err.code === 'P2003' ||
  err.code === '23001' ||
  err.message?.includes('23001') ||
  err.message?.includes('violates RESTRICT setting')
) {
    statusCode = 409;
    message =
      'Operation not allowed: related record does not exist, or other records depend on this one';
  }

  // Unexpected error: asli kaaran fakt terminal ma, user ne generic message
  if (statusCode === 500) {
    console.error('Unexpected error:', err);
    message = 'Something went wrong on the server';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { errors: details }),
  });
};