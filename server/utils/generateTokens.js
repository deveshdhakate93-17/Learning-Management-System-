import jwt from 'jsonwebtoken';

/**
 * Generate access + refresh JWT token pair.
 * @param {string} userId - MongoDB user _id
 * @param {boolean} [rememberMe=false] - Extends token expiry
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const generateTokens = (userId, rememberMe = false) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: rememberMe ? '7d' : (process.env.JWT_EXPIRES_IN || '15m') }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: rememberMe ? '30d' : '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * Set refresh token as httpOnly cookie on response.
 * @param {object} res - Express response object
 * @param {string} refreshToken - JWT refresh token
 * @param {boolean} [rememberMe=false] - Extends cookie maxAge
 */
export const setRefreshCookie = (res, refreshToken, rememberMe = false) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
  });
};

export default generateTokens;
