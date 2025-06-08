import jwt from 'jsonwebtoken';
import config from './config.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiration,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

const attachCookies = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    secure: process.env.NODE_ENV === 'production',
    signed: true,
  });
};

export { generateToken, verifyToken, attachCookies };