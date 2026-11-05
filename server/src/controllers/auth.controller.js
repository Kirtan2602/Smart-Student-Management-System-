import asyncHandler from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';

const COOKIE_NAME = 'refreshToken';

// httpOnly: JavaScript (ane hackers ni script) aa cookie vanchi na shake
const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/auth',
};

const setRefreshCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, {
    ...baseCookieOptions,
    maxAge: authService.REFRESH_MAX_AGE_MS,
  });
};

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { accessToken, refreshToken, user } = await authService.login({
    email,
    password,
    ipAddress: req.ip,
  });

  setRefreshCookie(res, refreshToken);

  res.json({
    success: true,
    message: 'Login successful',
    data: { accessToken, user },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await authService.refresh(
    req.cookies?.[COOKIE_NAME]
  );

  setRefreshCookie(res, refreshToken);

  res.json({ success: true, data: { accessToken, user } });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies?.[COOKIE_NAME], req.ip);
  res.clearCookie(COOKIE_NAME, baseCookieOptions);
  res.json({ success: true, message: 'Logged out successfully' });
});

export const me = asyncHandler(async (req, res) => {
  const data = await authService.getProfile(req.user.id);
  res.json({ success: true, data });
});