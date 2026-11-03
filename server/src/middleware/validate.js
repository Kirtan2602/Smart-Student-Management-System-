import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

// Validator na result check kare. Error hoy to aagal na jaay.
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const details = result.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));

  next(new ApiError(400, 'Validation failed', details));
};

export default validate;